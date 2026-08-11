const { readData, writeData } = require('./db');
const { logAudit } = require('./auditLogger');

async function checkInterviewReminders() {
  const data = await readData();
  const now = new Date();
  let updated = false;

  for (const interview of data.interviews) {
    // 1. Check if interview date is tomorrow (within ~24-36h) and reminder hasn't been sent yet
    const interviewTime = new Date(`${interview.interviewDate}T10:00:00`).getTime();
    const timeUntilInterviewMs = interviewTime - now.getTime();
    const hoursUntilInterview = timeUntilInterviewMs / (1000 * 60 * 60);

    if (hoursUntilInterview > 0 && hoursUntilInterview <= 36 && !interview.reminderSentAt && interview.confirmationStatus === 'Pending_Confirmation') {
      interview.reminderSentAt = now.toISOString();
      // Set 12-hour confirmation deadline
      const deadline = new Date(now.getTime() + 12 * 60 * 60 * 1000);
      interview.reminderDeadline = deadline.toISOString();
      updated = true;

      // Add push message to simulated LINE chat
      data.lineMessages.push({
        id: `msg-${Date.now()}-${Math.floor(Math.random()*100)}`,
        lineUserId: interview.lineUserId,
        sender: 'system',
        text: `[การแจ้งเตือนสิทธิ์สัมภาษณ์ 1 วันก่อนถึงกำหนด]\nคุณมีนัดสัมภาษณ์ตำแหน่ง ${interview.position} วันที่ ${interview.interviewDate} เวลา ${interview.timeSlot}\n\nกรุณากดยืนยัน เลื่อน หรือยกเลิก ภายใน 12 ชั่วโมง (หมดเขต: ${deadline.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.) หากไม่ตอบรับถือว่าสละสิทธิ์`,
        timestamp: now.toISOString(),
        requiresConfirmation: true,
        interviewId: interview.id
      });

      await logAudit({
        user: 'system_cron',
        userName: 'ระบบส่งแจ้งเตือนอัตโนมัติ',
        action: 'SEND_LINE_REMINDER_1DAY',
        details: `ส่งการแจ้งเตือนสัมภาษณ์ 1 วันล่วงหน้า ให้แก่ ${interview.applicantName} (นัดหมาย: ${interview.interviewDate}) กำหนดตอบกลับภายใน 12 ชม.`
      });
    }

    // 2. Check if 12-hour deadline has passed for pending confirmations
    if (interview.confirmationStatus === 'Pending_Confirmation' && interview.reminderDeadline) {
      const deadlineTime = new Date(interview.reminderDeadline).getTime();
      if (now.getTime() > deadlineTime) {
        interview.confirmationStatus = 'Cancelled_Auto_12h';
        updated = true;

        // Update corresponding applicant status
        const applicant = data.applicants.find(a => a.id === interview.applicantId);
        if (applicant) {
          applicant.status = 'Cancelled';
        }

        // Add auto-cancel message in LINE chat
        data.lineMessages.push({
          id: `msg-cancel-${Date.now()}`,
          lineUserId: interview.lineUserId,
          sender: 'system',
          text: `⚠️ [ยกเลิกการนัดหมายอัตโนมัติ]\nเนื่องจากไม่มีการตอบรับการนัดสัมภาษณ์ตำแหน่ง ${interview.position} ภายใน 12 ชั่วโมงที่กำหนด ระบบได้ทำการยกเลิกนัดหมายเรียบร้อยแล้ว`,
          timestamp: now.toISOString()
        });

        await logAudit({
          user: 'system_cron',
          userName: 'ระบบจัดการเวลาอัตโนมัติ',
          action: 'AUTO_CANCEL_INTERVIEW_12H',
          details: `ยกเลิกสิทธิ์นัดสัมภาษณ์ของ ${interview.applicantName} อัตโนมัติ เนื่องจากพ้นกำหนดเวลาตอบรับ 12 ชั่วโมง`
        });
      }
    }
  }

  if (updated) {
    await writeData(data);
  }
}

function startReminderCron() {
  // Initial run
  checkInterviewReminders().catch((error) => console.error('Reminder check failed:', error));
  // Interval every 15 seconds for reactive UI experience
  setInterval(() => {
    checkInterviewReminders().catch((error) => console.error('Reminder check failed:', error));
  }, 15000);
}

module.exports = {
  checkInterviewReminders,
  startReminderCron
};
