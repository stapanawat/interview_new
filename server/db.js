const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data.json');

// Retained only temporarily below as a historical schema reference; never loaded.
const exampleData = {
  users: [
    {
      id: 'usr-1',
      username: 'admin',
      password: 'password123',
      name: 'สมชาย ใจดี (HR Manager)',
      role: 'Super Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 'usr-2',
      username: 'hr_recruiter',
      password: 'password123',
      name: 'นภาพร รักษ์สุข (Recruiter)',
      role: 'HR Specialist',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
    }
  ],
  auditLogs: [
    {
      id: 'log-101',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      user: 'admin',
      userName: 'สมชาย ใจดี (HR Manager)',
      action: 'LOGIN',
      details: 'เข้าสู่ระบบสำเร็จผ่านทาง Web Admin Portal',
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    {
      id: 'log-102',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      user: 'admin',
      userName: 'สมชาย ใจดี (HR Manager)',
      action: 'VIEW_APPLICANTS',
      details: 'เข้าตรวจเช็ครายการผู้สมัครงานใหม่ประจำวัน',
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  ],
  applicants: [
    {
      id: 'app-001',
      name: 'พิชญา สุวรรณเวช',
      email: 'pichaya.s@gmail.com',
      phone: '081-234-5678',
      position: 'Senior Frontend Developer',
      expectedSalary: 65000,
      lineUserId: 'U1002948182',
      lineDisplayName: 'Pichaya_Dev',
      appliedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      status: 'Passed',
      experience: '5 ปี (React, TypeScript, Next.js)',
      notes: 'ผลการสัมภาษณ์ทางเทคนิคยอดเยี่ยม มีความกระตือรือร้นสูง พร้อมเริ่มงานได้ทันที',
      interviewId: 'int-001'
    },
    {
      id: 'app-002',
      name: 'ณัฐพงษ์ วงศ์สว่าง',
      email: 'nattapong.dev@outlook.com',
      phone: '089-876-5432',
      position: 'UX/UI Designer',
      expectedSalary: 48000,
      lineUserId: 'U992817263',
      lineDisplayName: 'Nattapong UI',
      appliedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: 'Confirmed',
      experience: '3 ปี (Figma, Design System, Pastel UI)',
      notes: 'มี Portfolio ผลงามโดดเด่น สไตล์งานมินิมอลสบายตา',
      interviewId: 'int-002'
    },
    {
      id: 'app-003',
      name: 'กมลชนก เลิศวิทยา',
      email: 'kamonchanok.l@hotmail.com',
      phone: '086-555-1234',
      position: 'Fullstack Developer',
      expectedSalary: 55000,
      lineUserId: 'U883719204',
      lineDisplayName: 'Kamon_Code',
      appliedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      status: 'Pending_Confirmation',
      experience: '4 ปี (Node.js, Vue, PostgreSQL)',
      notes: 'ผ่านการคัดเลือกเรซูเม่เรียบร้อย รอ candidate ตอบรับวันสัมภาษณ์ในไลน์ (มีระบบเตือน 12 ชม.)',
      interviewId: 'int-003'
    }
  ],
  interviews: [
    {
      id: 'int-001',
      applicantId: 'app-001',
      applicantName: 'พิชญา สุวรรณเวช',
      position: 'Senior Frontend Developer',
      lineUserId: 'U1002948182',
      interviewDate: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
      timeSlot: '14:00 - 15:00',
      format: 'Online (Google Meet)',
      locationOrLink: 'https://meet.google.com/abc-defg-hij',
      confirmationStatus: 'Confirmed',
      reminderSentAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      reminderDeadline: new Date(Date.now() - 86400000 * 1.5).toISOString(),
      createdBy: 'admin'
    },
    {
      id: 'int-002',
      applicantId: 'app-002',
      applicantName: 'ณัฐพงษ์ วงศ์สว่าง',
      position: 'UX/UI Designer',
      lineUserId: 'U992817263',
      interviewDate: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0],
      timeSlot: '10:30 - 11:30',
      format: 'On-Site',
      locationOrLink: 'ห้องประชุม Pastel Room ชั้น 4',
      confirmationStatus: 'Confirmed',
      reminderSentAt: new Date(Date.now() - 3600000 * 10).toISOString(),
      reminderDeadline: new Date(Date.now() + 3600000 * 2).toISOString(),
      createdBy: 'admin'
    },
    {
      id: 'int-003',
      applicantId: 'app-003',
      applicantName: 'กมลชนก เลิศวิทยา',
      position: 'Fullstack Developer',
      lineUserId: 'U883719204',
      interviewDate: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0],
      timeSlot: '15:00 - 16:00',
      format: 'Online (Google Meet)',
      locationOrLink: 'https://meet.google.com/xyz-uvwx-rst',
      confirmationStatus: 'Pending_Confirmation',
      reminderSentAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      // Deadline is set to 12 hours from reminder setup
      reminderDeadline: new Date(Date.now() + 3600000 * 10).toISOString(),
      createdBy: 'admin'
    }
  ],
  employees: [
    {
      id: 'emp-001',
      name: 'พิชญา สุวรรณเวช',
      email: 'pichaya.s@gmail.com',
      phone: '081-234-5678',
      position: 'Senior Frontend Developer',
      monthlySalary: 65000,
      hiredDate: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
      notes: 'ย้ายจากสถานะสมัครงาน (ผ่านสัมภาษณ์) วันที่เริ่มงานคือวันที่ 1 ของเดือนถัดไป มีความเชี่ยวชาญ React & Design System',
      status: 'Active',
      sourceApplicantId: 'app-001'
    },
    {
      id: 'emp-002',
      name: 'อนันต์ ทรัพย์มหาศาล',
      email: 'anan.t@company.co.th',
      phone: '082-999-8877',
      position: 'Backend Tech Lead',
      monthlySalary: 85000,
      hiredDate: '2024-01-15',
      notes: 'ดูแลโครงสร้างพื้นฐานระบบ Database และ API Security มีโอทีและเบี้ยขยันเพิ่มเติม',
      status: 'Active',
      sourceApplicantId: null
    }
  ],
  lineMessages: [
    {
      id: 'msg-1',
      lineUserId: 'U1002948182',
      sender: 'system',
      text: 'สวัสดีค่ะ ยินดีต้อนรับสู่ระบบรับสมัครพนักงาน กรุณากรอกแบบฟอร์มสมัครงานผ่านลิงก์นี้ค่ะ: [สมัครงานที่นี่]',
      timestamp: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'msg-2',
      lineUserId: 'U883719204',
      sender: 'system',
      text: 'แจ้งเตือนนัดสัมภาษณ์งานตำแหน่ง Fullstack Developer ในวันที่พรุ่งนี้ เวลา 15:00 - 16:00 น.\n\nกรุณายืนยันเข้าร่วมภายใน 12 ชั่วโมง หากไม่ตอบรับระบบจะยกเลิกสิทธิ์อัตโนมัติ',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      requiresConfirmation: true,
      interviewId: 'int-003'
    }
  ]
};

const defaultData = {
  users: [],
  auditLogs: [],
  applicants: [],
  interviews: [],
  employees: [],
  lineMessages: []
};

function readLocalData() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
    return defaultData;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db.json, returning defaultData:', err);
    return defaultData;
  }
}

function writeLocalData(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to db.json:', err);
  }
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url: url.replace(/\/$/, ''), key } : null;
}

async function readData() {
  const config = supabaseConfig();
  if (!config) return readLocalData();

  const response = await fetch(`${config.url}/rest/v1/app_state?id=eq.1&select=data`, {
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`
    }
  });
  if (!response.ok) throw new Error(`Supabase read failed: ${response.status}`);
  const rows = await response.json();
  return rows[0]?.data || defaultData;
}

async function writeData(data) {
  const config = supabaseConfig();
  if (!config) {
    writeLocalData(data);
    return;
  }

  const response = await fetch(`${config.url}/rest/v1/app_state?on_conflict=id`, {
    method: 'POST',
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal'
    },
    body: JSON.stringify({ id: 1, data, updated_at: new Date().toISOString() })
  });
  if (!response.ok) throw new Error(`Supabase write failed: ${response.status}`);
}

module.exports = { readData, writeData, defaultData };
