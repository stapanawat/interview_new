const LIFF_ID = process.env.VITE_LIFF_ID || '';

function getApplicationUrl(lineUserId, baseUrl) {
  if (LIFF_ID) {
    return `https://liff.line.me/${LIFF_ID}`;
  }
  return `${baseUrl}/apply?lineUserId=${encodeURIComponent(lineUserId)}`;
}

function getWelcomeMessage(lineUserId, baseUrl) {
  const applicationUrl = getApplicationUrl(lineUserId, baseUrl);
  return `สวัสดีค่ะ! 😊 ยินดีต้อนรับเข้าสู่ระบบรับสมัครงานออนไลน์ค่ะ 🌸✨

เรายินดีอย่างยิ่งที่ได้พบคุณนะคะ คุณสามารถเลือกใช้งานบริการต่างๆ ผ่านเมนูด้านล่างนี้ได้เลยค่ะ:

📝 1. สมัครงานออนไลน์
กรอกข้อมูลประวัติและตำแหน่งงานที่สนใจง่ายๆ ผ่านลิงก์นี้:
👉 ${applicationUrl}

🔍 2. ตรวจสอบสถานะการสมัคร / นัดสัมภาษณ์
พิมพ์คำว่า "สถานะ" เพื่อเช็กสถานะล่าสุดได้ตลอด 24 ชม.

💼 3. ดูตำแหน่งงานที่เปิดรับสมัคร
พิมพ์คำว่า "ตำแหน่งงาน" เพื่อดูตำแหน่งที่เปิดรับในปัจจุบัน

💬 4. สอบถามข้อมูลเพิ่มเติม / ติดต่อ HR
พิมพ์ข้อความสอบถามทิ้งไว้ได้เลยค่ะ เจ้าหน้าที่ HR จะรีบติดต่อกลับโดยเร็วที่สุดนะคะ 🙏🏻`;
}

function getStatusMessage(applicant, interview, applicationUrl) {
  if (!applicant) {
    return `ยังไม่พบข้อมูลใบสมัครของคุณในระบบค่ะ 😊\n\nหากสนใจร่วมงานกับเรา สามารถกดกรอกแบบฟอร์มสมัครงานผ่านลิงก์นี้ได้เลยนะคะ:\n👉 ${applicationUrl}`;
  }

  let statusText = '';
  switch (applicant.status) {
    case 'Pending':
      statusText = '⏳ อยู่ระหว่างการตรวจสอบข้อมูลโดยทีมงาน HR';
      break;
    case 'Pending_Confirmation':
      statusText = '📅 เจ้าหน้าที่ส่งใบนัดสัมภาษณ์แล้ว กรุณากดยืนยันนัดหมายในแชตนี้ค่ะ (ภายใน 12 ชม.)';
      break;
    case 'Confirmed':
      statusText = '✅ ยืนยันวันเวลานัดสัมภาษณ์เรียบร้อยแล้ว';
      break;
    case 'Passed':
      statusText = '🎉 ยินดีด้วยค่ะ! คุณผ่านการคัดเลือกเรียบร้อยแล้ว';
      break;
    case 'Failed':
      statusText = 'ขอบคุณที่ให้ความสนใจสมัครงานกับเราค่ะ';
      break;
    case 'Cancelled':
      statusText = 'รายการสมัคร/นัดสัมภาษณ์ถูกยกเลิกแล้ว';
      break;
    default:
      statusText = applicant.status;
  }

  let text = `📌 สถานะการสมัครงานของคุณ ${applicant.name}\n\n` +
    `• ตำแหน่งงาน: ${applicant.position}\n` +
    `• สถานะปัจจุบัน: ${statusText}\n` +
    `• วันที่สมัคร: ${new Date(applicant.appliedAt).toLocaleDateString('th-TH')}\n`;

  if (interview) {
    text += `\n📅 ข้อมูลนัดหมายสัมภาษณ์:\n` +
      `• วันที่: ${interview.interviewDate}\n` +
      `• เวลา: ${interview.timeSlot}\n` +
      `• รูปแบบ: ${interview.format}\n` +
      `• ลิงก์/สถานที่: ${interview.locationOrLink || '-'}\n`;
  }

  return text;
}

function getPositionsMessage(positions, applicationUrl) {
  const openPositions = (positions || []).filter(p => p.status === 'Open');
  if (openPositions.length === 0) {
    return `ขณะนี้ยังไม่มีตำแหน่งงานเปิดรับสมัครเพิ่มเติมค่ะ 😊\nคุณสามารถลงทะเบียนฝากประวัติไว้ก่อนได้ที่:\n👉 ${applicationUrl}`;
  }

  let text = `💼 ตำแหน่งงานที่กำลังเปิดรับสมัครอยู่ในขณะนี้ ✨\n\n`;
  openPositions.forEach((p, idx) => {
    text += `${idx + 1}. ${p.name}${p.department ? ` (${p.department})` : ''}\n`;
  });
  text += `\nสนใจตำแหน่งไหน สามารถกดกรอกใบสมัครได้ทันทีเลยนะคะ:\n👉 ${applicationUrl}`;
  return text;
}

function getFallbackMessage(applicationUrl) {
  return `ขอบคุณสำหรับข้อความนะคะ 😊🙏🏻\nระบบได้บันทึกข้อความของคุณเรียบร้อยแล้ว เจ้าหน้าที่ HR จะรีบมาตอบคำถามให้โดยเร็วที่สุดค่ะ\n\n💡 เมนูด่วนที่ใช้งานได้:\n• พิมพ์ "สมัครงาน" เพื่อรับลิงก์แบบฟอร์ม\n• พิมพ์ "สถานะ" เพื่อเช็กสถานะใบสมัคร\n• พิมพ์ "ตำแหน่งงาน" เพื่อดูตำแหน่งที่เปิดรับ\n\nหรือสมัครได้ทันทีที่: 👉 ${applicationUrl}`;
}

function handleLineCommand(text, lineUserId, baseUrl, data) {
  const trimmed = (text || '').trim();
  const applicationUrl = getApplicationUrl(lineUserId, baseUrl);

  // 1. Follow / Welcome / Hello / Apply / Help
  if (/สมัครงาน|สวัสดี|สนใจ|เริ่มต้น|เริ่ม|สวัสดีครับ|สวัสดีค่ะ|เมนู|ช่วยเหลือ|help|start/i.test(trimmed)) {
    return {
      text: getWelcomeMessage(lineUserId, baseUrl),
      actionLink: applicationUrl
    };
  }

  // 2. Check status
  if (/สถานะ|เช็คสถานะ|เช็กสถานะ|สัมภาษณ์|status/i.test(trimmed)) {
    const applicant = (data.applicants || []).find(a => a.lineUserId === lineUserId);
    const interview = applicant ? (data.interviews || []).find(i => i.applicantId === applicant.id || i.id === applicant.interviewId) : null;
    return {
      text: getStatusMessage(applicant, interview, applicationUrl),
      actionLink: applicant ? null : applicationUrl
    };
  }

  // 3. Check open positions
  if (/ตำแหน่ง|ตำแหน่งงาน|เปิดรับ|positions/i.test(trimmed)) {
    return {
      text: getPositionsMessage(data.positions || [], applicationUrl),
      actionLink: applicationUrl
    };
  }

  // 4. Candidate Interview Confirmation / Postpone / Cancel commands
  if (/ยืนยัน|ตกลง|เข้าร่วม|รับนัด|พร้อม/i.test(trimmed)) {
    const applicant = (data.applicants || []).find(a => a.lineUserId === lineUserId);
    const interview = applicant ? (data.interviews || []).find(i => (i.applicantId === applicant.id || i.id === applicant.interviewId) && i.confirmationStatus === 'Pending_Confirmation') : null;

    if (interview) {
      interview.confirmationStatus = 'Confirmed';
      if (applicant) applicant.status = 'Confirmed';
      return {
        text: `✅ ขอบคุณสำหรับการยืนยันค่ะคุณ ${applicant ? applicant.name : ''}! ระบบได้บันทึกการเข้าร่วมสัมภาษณ์ของคุณเรียบร้อยแล้ว เจอกันวันที่ ${interview.interviewDate} เวลา ${interview.timeSlot} นะคะ ✨`,
        actionLink: null
      };
    } else {
      return {
        text: `ขอบคุณค่ะ 😊 ไม่พบรายการนัดสัมภาษณ์ที่รอการยืนยันในขณะนี้ค่ะ คุณสามารถพิมพ์คำว่า "สถานะ" เพื่อเช็กข้อมูลนัดหมายล่าสุดได้เลยนะคะ`,
        actionLink: null
      };
    }
  }

  if (/ขอเลื่อน|เลื่อนวัน|เลื่อนนัด|เลื่อน/i.test(trimmed)) {
    const applicant = (data.applicants || []).find(a => a.lineUserId === lineUserId);
    const interview = applicant ? (data.interviews || []).find(i => (i.applicantId === applicant.id || i.id === applicant.interviewId) && i.confirmationStatus === 'Pending_Confirmation') : null;

    if (interview) {
      interview.confirmationStatus = 'Postponed';
      if (applicant) applicant.status = 'Rescheduled';
      return {
        text: `🗓️ ได้รับคำขอเลื่อนวันสัมภาษณ์ของคุณเรียบร้อยแล้วค่ะ เจ้าหน้าที่ HR จะติดต่อกลับทาง LINE อีกครั้งเพื่อจัดสรรวันนัดหมายใหม่ให้นะคะ 🙏🏻`,
        actionLink: null
      };
    } else {
      return {
        text: `ขอบคุณค่ะ 😊 หากต้องการเลื่อนนัดหมาย สามารถพิมพ์ข้อความระบุวันที่สะดวกทิ้งไว้ได้เลยค่ะ เจ้าหน้าที่ HR จะรีบตรวจสอบให้นะคะ`,
        actionLink: null
      };
    }
  }

  if (/ยกเลิก|ไม่สะดวก|สละสิทธิ์/i.test(trimmed)) {
    const applicant = (data.applicants || []).find(a => a.lineUserId === lineUserId);
    const interview = applicant ? (data.interviews || []).find(i => (i.applicantId === applicant.id || i.id === applicant.interviewId) && i.confirmationStatus === 'Pending_Confirmation') : null;

    if (interview) {
      interview.confirmationStatus = 'Cancelled_User';
      if (applicant) applicant.status = 'Cancelled';
      return {
        text: `❌ ระบบทำการยกเลิกนัดหมายสัมภาษณ์ของคุณเรียบร้อยแล้วค่ะ ขอบคุณที่ให้ความสนใจสมัครงานกับเรานะคะ 🙏🏻`,
        actionLink: null
      };
    } else {
      return {
        text: `รับทราบค่ะ หากมีข้อสงสัยเพิ่มเติม สามารถพิมพ์ข้อความทิ้งไว้ให้ HR ได้เลยนะคะ 😊`,
        actionLink: null
      };
    }
  }

  // 5. Default / Contact HR
  return {
    text: getFallbackMessage(applicationUrl),
    actionLink: applicationUrl
  };
}

module.exports = {
  getWelcomeMessage,
  getStatusMessage,
  getPositionsMessage,
  getFallbackMessage,
  handleLineCommand
};
