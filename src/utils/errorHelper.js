export function toHumanError(error, defaultMessage = 'เกิดข้อผิดพลาดขึ้นในระบบ กรุณาลองใหม่อีกครั้ง') {
  const msg = typeof error === 'string' ? error : (error?.message || '');

  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('Network request failed')) {
    return 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของท่าน แล้วลองใหม่อีกครั้งค่ะ';
  }
  if (msg.includes('401') || msg.includes('Unauthorized') || msg.includes('จำเป็นต้องระบุตัวตน') || msg.includes('เข้าสู่ระบบ')) {
    return 'สิทธิ์การเข้าใช้งานของคุณหมดอายุ หรือยังไม่ได้เข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่อีกครั้งค่ะ';
  }
  if (msg.includes('404')) {
    return 'ไม่พบข้อมูลที่ต้องการในระบบ กรุณารีเฟรชหน้าจอแล้วลองใหม่อีกครั้งค่ะ';
  }
  if (msg.includes('500') || msg.includes('Internal Server Error')) {
    return 'ระบบขัดข้องชั่วคราวในการประมวลผล กรุณาลองใหม่อีกครั้งในภายหลัง หรือติดต่อผู้ดูแลระบบค่ะ';
  }
  if (msg.trim()) {
    return msg;
  }
  return defaultMessage;
}
