const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../db');
const { logAudit } = require('../auditLogger');

// GET all employees
router.get('/', async (req, res) => {
  const data = await readData();
  res.json(data.employees);
});

// POST add a new employee manually
router.post('/', async (req, res) => {
  const { name, email, phone, position, monthlySalary, notes, hiredDate, adminUser, adminName } = req.body;

  if (!name || !phone || !monthlySalary || !position) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูล รายชื่อ, เบอร์โทรศัพท์ และอัตราเงินเดือน (รายเดือน)' });
  }

  const data = await readData();
  if (!data.positions.some((item) => item.name === position && item.status === 'Open')) {
    return res.status(400).json({ error: 'กรุณาเลือกตำแหน่งงานที่เปิดใช้งาน' });
  }
  const newEmp = {
    id: `emp-${Date.now()}`,
    name,
    email: email || '',
    phone,
    position,
    monthlySalary: Number(monthlySalary) || 0,
    hiredDate: hiredDate || new Date().toISOString().split('T')[0],
    notes: notes || '',
    status: 'Active',
    sourceApplicantId: null
  };

  data.employees.unshift(newEmp);
  await writeData(data);

  await logAudit({
    user: adminUser || 'admin',
    userName: adminName || 'ผู้ดูแลระบบ',
    action: 'ADD_EMPLOYEE',
    details: `เพิ่มพนักงานใหม่: ${name} (ตำแหน่ง: ${newEmp.position}, เงินเดือน: ฿${Number(monthlySalary).toLocaleString()})`,
    req
  });

  res.status(201).json({
    message: 'เพิ่มข้อมูลพนักงานเรียบร้อยแล้ว',
    employee: newEmp
  });
});

// PUT update employee details (Name, Email, Phone, Monthly Salary, Notes, Status)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, position, monthlySalary, notes, status, adminUser, adminName } = req.body;
  const data = await readData();

  const emp = data.employees.find(e => e.id === id);
  if (!emp) {
    return res.status(404).json({ error: 'ไม่พบข้อมูลพนักงาน' });
  }

  if (position && position !== emp.position && !data.positions.some((item) => item.name === position && item.status === 'Open')) {
    return res.status(400).json({ error: 'กรุณาเลือกตำแหน่งงานที่เปิดใช้งาน' });
  }

  const changes = [];
  if (name && name !== emp.name) { changes.push(`ชื่อ: ${emp.name} -> ${name}`); emp.name = name; }
  if (email !== undefined && email !== emp.email) { emp.email = email; }
  if (phone && phone !== emp.phone) { changes.push(`เบอร์โทร: ${emp.phone} -> ${phone}`); emp.phone = phone; }
  if (position && position !== emp.position) { changes.push(`ตำแหน่ง: ${emp.position} -> ${position}`); emp.position = position; }
  if (monthlySalary !== undefined && Number(monthlySalary) !== emp.monthlySalary) {
    changes.push(`เงินเดือน: ฿${emp.monthlySalary.toLocaleString()} -> ฿${Number(monthlySalary).toLocaleString()}`);
    emp.monthlySalary = Number(monthlySalary);
  }
  if (notes !== undefined) { emp.notes = notes; }
  if (status && status !== emp.status) { changes.push(`สถานะ: ${emp.status} -> ${status}`); emp.status = status; }

  await writeData(data);

  await logAudit({
    user: adminUser || 'admin',
    userName: adminName || 'ผู้ดูแลระบบ',
    action: 'EDIT_EMPLOYEE',
    details: `แก้ไขข้อมูลพนักงาน ${emp.name}: ${changes.length > 0 ? changes.join(', ') : 'อัปเดตรายละเอียดเพิ่มเติม'}`,
    req
  });

  res.json({
    message: 'บันทึกการแก้ไขข้อมูลพนักงานเรียบร้อยแล้ว',
    employee: emp
  });
});

// DELETE remove employee
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { adminUser, adminName } = req.query;
  const data = await readData();

  const empIndex = data.employees.findIndex(e => e.id === id);
  if (empIndex === -1) {
    return res.status(404).json({ error: 'ไม่พบข้อมูลพนักงาน' });
  }

  const removed = data.employees.splice(empIndex, 1)[0];
  await writeData(data);

  await logAudit({
    user: adminUser || 'admin',
    userName: adminName || 'ผู้ดูแลระบบ',
    action: 'DELETE_EMPLOYEE',
    details: `ลบข้อมูลพนักงาน: ${removed.name} (${removed.position})`,
    req
  });

  res.json({ message: 'ลบข้อมูลพนักงานสำเร็จ', employee: removed });
});

module.exports = router;
