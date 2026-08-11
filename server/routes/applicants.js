const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../db');
const { logAudit } = require('../auditLogger');

// GET all applicants
router.get('/', async (req, res) => {
  const data = await readData();
  res.json(data.applicants);
});

// POST submit candidate application from LINE form link
router.post('/submit', async (req, res) => {
  const { name, email, phone, position, expectedSalary, age, vehicle, lineUserId, lineDisplayName, experience, notes } = req.body;
  
  if (!name || !phone || !position) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูล ชื่อ, เบอร์โทรศัพท์ และตำแหน่งงานให้ครบถ้วน' });
  }

  const data = await readData();
  const selectedPosition = data.positions.find((item) => item.name === position);
  if (!selectedPosition || selectedPosition.status !== 'Open') {
    return res.status(400).json({ error: 'ตำแหน่งงานนี้ไม่เปิดรับสมัครแล้ว' });
  }
  const applicantId = `app-${Date.now()}`;
  const now = new Date().toISOString();

  const newApplicant = {
    id: applicantId,
    name,
    email: email || '',
    phone,
    position,
    expectedSalary: Number(expectedSalary) || 0,
    age: age ? Number(age) : null,
    vehicle: vehicle || 'ไม่มี',
    lineUserId: lineUserId || `LINE-${Math.floor(100000 + Math.random() * 900000)}`,
    lineDisplayName: lineDisplayName || name,
    appliedAt: now,
    status: 'Pending',
    experience: experience || '',
    notes: notes || '',
    interviewId: null
  };

  data.applicants.unshift(newApplicant);

  // Push notification back into LINE simulator
  data.lineMessages.push({
    id: `msg-${Date.now()}`,
    lineUserId: newApplicant.lineUserId,
    sender: 'system',
    text: `ระบบได้รับแบบฟอร์มใบสมัครงานของคุณแล้ว!\nตำแหน่ง: ${position}\nผู้สมัคร: ${name}\nเจ้าหน้าที่จะทำการตรวจสอบข้อมูลและแจ้งกำหนดการนัดสัมภาษณ์ผ่าน LINE ในขั้นตอนถัดไปค่ะ`,
    timestamp: now
  });

  await writeData(data);

  await logAudit({
    user: 'applicant_public',
    userName: `${name} (ผู้สมัครงาน)`,
    action: 'SUBMIT_APPLICATION',
    details: `ส่งใบสมัครงานตำแหน่ง ${position} (เงินเดือนที่คาดหวัง: ฿${Number(expectedSalary).toLocaleString()})`,
    req
  });

  res.status(201).json({
    message: 'ส่งใบสมัครงานสำเร็จ',
    applicant: newApplicant
  });
});

// PATCH update status of applicant (e.g., Passed, Failed, Confirmed)
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, adminUser, adminName, notes } = req.body;
  const data = await readData();

  const applicant = data.applicants.find(a => a.id === id);
  if (!applicant) {
    return res.status(404).json({ error: 'ไม่พบข้อมูลผู้สมัคร' });
  }

  const oldStatus = applicant.status;
  applicant.status = status;
  if (notes !== undefined) {
    applicant.notes = notes;
  }

  let createdEmployee = null;

  // If status changed to "Passed", automatically add to Employee Management system!
  if (status === 'Passed' && oldStatus !== 'Passed') {
    // Check if employee already exists for this applicant
    const existingEmp = data.employees.find(e => e.sourceApplicantId === applicant.id);
    if (!existingEmp) {
      createdEmployee = {
        id: `emp-${Date.now()}`,
        name: applicant.name,
        email: applicant.email,
        phone: applicant.phone,
        position: applicant.position,
        monthlySalary: applicant.expectedSalary || 35000,
        hiredDate: new Date().toISOString().split('T')[0],
        notes: `บรรจุเป็นพนักงานจากการสมัครงานผ่าน LINE (หมายเหตุผู้สมัคร: ${applicant.notes || 'ผ่านการสัมภาษณ์เรียบร้อย'})`,
        status: 'Active',
        sourceApplicantId: applicant.id
      };
      data.employees.unshift(createdEmployee);
    }
  }

  await writeData(data);

  await logAudit({
    user: adminUser || 'admin',
    userName: adminName || 'ผู้ดูแลระบบ',
    action: 'UPDATE_CANDIDATE_STATUS',
    details: `เปลี่ยนสถานะผู้สมัคร ${applicant.name} จาก "${oldStatus}" เป็น "${status}"${createdEmployee ? ' (บันทึกข้อมูลเข้าสู่ระบบจัดการพนักงานเรียบร้อย)' : ''}`,
    req
  });

  res.json({
    message: 'อัปเดตสถานะสำเร็จ',
    applicant,
    employeeAdded: createdEmployee
  });
});

module.exports = router;
