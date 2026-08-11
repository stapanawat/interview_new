const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../db');
const { logAudit } = require('../auditLogger');
const { checkInterviewReminders } = require('../reminderEngine');
const { sendLinePushMessage } = require('../lineService');

function getInterviewNotificationText(interview) {
  return `[การนัดหมายสัมภาษณ์งาน 📅]\nเรียนคุณ ${interview.applicantName}\n\nตำแหน่งงาน: ${interview.position}\nวันที่สัมภาษณ์: ${interview.interviewDate}\nเวลา: ${interview.timeSlot}\nรูปแบบ: ${interview.format}\nสถานที่/ลิงก์: ${interview.locationOrLink}\n\n⚠️ กรุณากดยืนยันการเข้าร่วมสัมภาษณ์ในแชต LINE ภายใน 12 ชั่วโมงนะคะ`;
}

// GET all interviews
router.get('/', async (req, res) => {
  const data = await readData();
  res.json(data.interviews);
});

// POST schedule a new interview
router.post('/schedule', async (req, res) => {
  const { applicantId, interviewDate, timeSlot, format, locationOrLink, adminUser, adminName } = req.body;

  if (!applicantId || !interviewDate || !timeSlot) {
    return res.status(400).json({ error: 'กรุณาระบุข้อมูลผู้สมัคร วันที่ และช่วงเวลาสัมภาษณ์' });
  }

  const data = await readData();
  const applicant = data.applicants.find(a => a.id === applicantId);
  if (!applicant) {
    return res.status(404).json({ error: 'ไม่พบข้อมูลผู้สมัคร' });
  }

  const interviewId = `int-${Date.now()}`;
  const now = new Date();
  
  // Send 12h countdown deadline starting from reminder creation
  const deadline = new Date(now.getTime() + 12 * 60 * 60 * 1000);

  const newInterview = {
    id: interviewId,
    applicantId: applicant.id,
    applicantName: applicant.name,
    position: applicant.position,
    lineUserId: applicant.lineUserId,
    interviewDate,
    timeSlot,
    format: format || 'Online (Google Meet)',
    locationOrLink: locationOrLink || 'https://meet.google.com/interview-room',
    confirmationStatus: 'Pending_Confirmation',
    reminderSentAt: now.toISOString(),
    reminderDeadline: deadline.toISOString(),
    createdBy: adminUser || 'admin'
  };

  const deliveryText = getInterviewNotificationText(newInterview);
  const delivery = await sendLinePushMessage(applicant.lineUserId, deliveryText, { requiresConfirmation: true });
  if (!delivery.ok) {
    return res.status(502).json({
      error: 'LINE did not accept the interview message. The 12-hour confirmation window was not started.',
      lineDelivery: { status: delivery.status || null, error: delivery.error }
    });
  }

  applicant.status = 'Pending_Confirmation';
  applicant.interviewId = interviewId;
  newInterview.lineDelivery = { status: 'sent', sentAt: now.toISOString(), httpStatus: delivery.status };
  data.interviews.unshift(newInterview);

  const notificationText = `[การนัดหมายสัมภาษณ์งาน 📅]\nเรียนคุณ ${applicant.name}\n\nตำแหน่งงาน: ${applicant.position}\nวันที่สัมภาษณ์: ${interviewDate}\nเวลา: ${timeSlot}\nรูปแบบ: ${newInterview.format}\nสถานที่/ลิงก์: ${newInterview.locationOrLink}\n\n⚠️ กรุณากดยืนยันการเข้าร่วมสัมภาษณ์ในแชต LINE ภายใน 12 ชั่วโมงนะคะ`;

  // Send message to LINE simulator
  data.lineMessages.push({
    id: `msg-${Date.now()}`,
    lineUserId: applicant.lineUserId,
    sender: 'system',
    text: notificationText,
    timestamp: now.toISOString(),
    requiresConfirmation: true,
    interviewId: newInterview.id
  });

  await writeData(data);

  // Push real LINE message with interactive action buttons to user's LINE application

  await logAudit({
    user: adminUser || 'admin',
    userName: adminName || 'ผู้ดูแลระบบ',
    action: 'SCHEDULE_INTERVIEW',
    details: `นัดสัมภาษณ์ ${applicant.name} (ตำแหน่ง: ${applicant.position}) ในวันที่ ${interviewDate} เวลา ${timeSlot} (เริ่มนับถอยหลังยืนยัน 12 ชม.)`,
    req
  });

  res.status(201).json({
    message: 'สร้างนัดหมายสัมภาษณ์และส่งข้อความแจ้งเตือนทาง LINE เรียบร้อยแล้ว',
    interview: newInterview
  });
});

// Resend a pending appointment and restart its 12-hour window only after LINE accepts it.
router.post('/:interviewId/resend', async (req, res) => {
  const data = await readData();
  const interview = data.interviews.find((item) => item.id === req.params.interviewId);
  if (!interview) return res.status(404).json({ error: 'Interview not found' });
  if (interview.confirmationStatus !== 'Pending_Confirmation') {
    return res.status(409).json({ error: 'Only pending interviews can be resent' });
  }

  const delivery = await sendLinePushMessage(interview.lineUserId, getInterviewNotificationText(interview), { requiresConfirmation: true });
  if (!delivery.ok) {
    interview.lineDelivery = { status: 'failed', attemptedAt: new Date().toISOString(), httpStatus: delivery.status || null, error: delivery.error };
    await writeData(data);
    return res.status(502).json({ error: 'LINE did not accept the interview message', lineDelivery: interview.lineDelivery });
  }

  const now = new Date();
  interview.reminderSentAt = now.toISOString();
  interview.reminderDeadline = new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString();
  interview.lineDelivery = { status: 'sent', sentAt: now.toISOString(), httpStatus: delivery.status };
  data.lineMessages.push({ id: `msg-${Date.now()}`, lineUserId: interview.lineUserId, sender: 'system', text: getInterviewNotificationText(interview), timestamp: now.toISOString(), requiresConfirmation: true, interviewId: interview.id });
  await writeData(data);
  res.json({ message: 'LINE accepted the interview message; the 12-hour confirmation window has restarted.', interview });
});

// POST Candidate response from LINE simulator (Confirm, Postpone, Cancel)
router.post('/respond', async (req, res) => {
  const { interviewId, action, lineUserId, reason } = req.body;
  const data = await readData();

  const interview = data.interviews.find(i => i.id === interviewId);
  if (!interview) {
    return res.status(404).json({ error: 'ไม่พบนัดสัมภาษณ์ที่ระบุ' });
  }

  const applicant = data.applicants.find(a => a.id === interview.applicantId);
  const now = new Date().toISOString();

  if (action === 'CONFIRM') {
    interview.confirmationStatus = 'Confirmed';
    if (applicant) applicant.status = 'Confirmed';

    const confirmMsg = `ขอบคุณสำหรับการยืนยันค่ะ ระบบได้บันทึกการเข้าร่วมสัมภาษณ์ของคุณแล้ว เจอกันวันที่ ${interview.interviewDate} เวลา ${interview.timeSlot} นะคะ`;

    data.lineMessages.push({
      id: `msg-${Date.now()}`,
      lineUserId: interview.lineUserId,
      sender: 'user',
      text: '✅ ฉันยืนยันเข้าร่วมการสัมภาษณ์ตามวันและเวลาดังกล่าวค่ะ/ครับ',
      timestamp: now
    });
    data.lineMessages.push({
      id: `msg-reply-${Date.now()}`,
      lineUserId: interview.lineUserId,
      sender: 'system',
      text: confirmMsg,
      timestamp: now
    });

    await sendLinePushMessage(interview.lineUserId, confirmMsg);

    await logAudit({
      user: 'candidate_line',
      userName: `${interview.applicantName} (ผู้สมัคร)`,
      action: 'CANDIDATE_CONFIRM_INTERVIEW',
      details: `ผู้สมัครกดยืนยันเข้าร่วมสัมภาษณ์วันที่ ${interview.interviewDate} เวลา ${interview.timeSlot}`,
      req
    });

  } else if (action === 'POSTPONE') {
    interview.confirmationStatus = 'Postponed';
    if (applicant) applicant.status = 'Rescheduled';

    const postponeMsg = `ได้รับคำขอเลื่อนวันสัมภาษณ์เรียบร้อยแล้วค่ะ เจ้าหน้าที่ HR จะติดต่อกลับทาง LINE อีกครั้งเพื่อจัดสรรวันนัดหมายใหม่นะคะ`;

    data.lineMessages.push({
      id: `msg-${Date.now()}`,
      lineUserId: interview.lineUserId,
      sender: 'user',
      text: `ขอเลื่อนนัดสัมภาษณ์ ${reason ? `เนื่องจาก: ${reason}` : ''}`,
      timestamp: now
    });
    data.lineMessages.push({
      id: `msg-reply-${Date.now()}`,
      lineUserId: interview.lineUserId,
      sender: 'system',
      text: postponeMsg,
      timestamp: now
    });

    await sendLinePushMessage(interview.lineUserId, postponeMsg);

    await logAudit({
      user: 'candidate_line',
      userName: `${interview.applicantName} (ผู้สมัคร)`,
      action: 'CANDIDATE_POSTPONE_INTERVIEW',
      details: `ผู้สมัครขอเลื่อนวันสัมภาษณ์ (${reason || 'ไม่ระบุเหตุผล'})`,
      req
    });

  } else if (action === 'CANCEL') {
    interview.confirmationStatus = 'Cancelled_User';
    if (applicant) applicant.status = 'Cancelled';

    const cancelMsg = `ระบบทำการยกเลิกนัดหมายสัมภาษณ์ของคุณเรียบร้อยแล้ว ขอบคุณที่ให้ความสนใจกับบริษัทของเราค่ะ`;

    data.lineMessages.push({
      id: `msg-${Date.now()}`,
      lineUserId: interview.lineUserId,
      sender: 'user',
      text: '❌ ขอยกเลิกนัดสัมภาษณ์งานค่ะ/ครับ',
      timestamp: now
    });
    data.lineMessages.push({
      id: `msg-reply-${Date.now()}`,
      lineUserId: interview.lineUserId,
      sender: 'system',
      text: cancelMsg,
      timestamp: now
    });

    await sendLinePushMessage(interview.lineUserId, cancelMsg);

    await logAudit({
      user: 'candidate_line',
      userName: `${interview.applicantName} (ผู้สมัคร)`,
      action: 'CANDIDATE_CANCEL_INTERVIEW',
      details: `ผู้สมัครกดยกเลิกนัดสัมภาษณ์งาน`,
      req
    });
  }

  await writeData(data);
  res.json({ message: 'บันทึกการตอบรับสัมภาษณ์สำเร็จ', interview, applicant });
});

// POST simulate 12-hour timeout trigger instantly for testing
router.post('/simulate-timeout', async (req, res) => {
  const { interviewId } = req.body;
  const data = await readData();

  const interview = data.interviews.find(i => i.id === interviewId);
  if (!interview) {
    return res.status(404).json({ error: 'ไม่พบรายการสัมภาษณ์' });
  }

  // Force deadline to past
  interview.reminderDeadline = new Date(Date.now() - 1000).toISOString();
  await writeData(data);

  // Trigger check
  await checkInterviewReminders();

  res.json({ message: 'จำลองสภาวะหมดเวลา 12 ชั่วโมงเรียบร้อยแล้ว (ระบบยกเลิกนัดหมายอัตโนมัติ)' });
});

module.exports = router;
