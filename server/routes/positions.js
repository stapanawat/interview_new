const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../db');
const { logAudit } = require('../auditLogger');

const validStatuses = new Set(['Open', 'Closed']);
const cleanName = (value) => String(value || '').trim();

router.get('/', async (req, res, next) => {
  try { res.json((await readData()).positions); } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const name = cleanName(req.body.name);
    const department = cleanName(req.body.department);
    if (!name) return res.status(400).json({ error: 'กรุณาระบุชื่อตำแหน่งงาน' });
    const data = await readData();
    if (data.positions.some((p) => p.name.toLowerCase() === name.toLowerCase())) return res.status(409).json({ error: 'มีตำแหน่งงานนี้อยู่แล้ว' });
    const position = { id: `pos-${Date.now()}`, name, department, status: validStatuses.has(req.body.status) ? req.body.status : 'Open', createdAt: new Date().toISOString() };
    data.positions.push(position);
    await writeData(data);
    await logAudit({ user: req.body.adminUser || 'admin', userName: req.body.adminName || 'ผู้ดูแลระบบ', action: 'CREATE_POSITION', details: `เพิ่มตำแหน่งงาน ${name}`, req });
    res.status(201).json(position);
  } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const position = data.positions.find((p) => p.id === req.params.id);
    if (!position) return res.status(404).json({ error: 'ไม่พบตำแหน่งงาน' });
    const name = cleanName(req.body.name);
    if (!name) return res.status(400).json({ error: 'กรุณาระบุชื่อตำแหน่งงาน' });
    if (data.positions.some((p) => p.id !== position.id && p.name.toLowerCase() === name.toLowerCase())) return res.status(409).json({ error: 'มีตำแหน่งงานนี้อยู่แล้ว' });
    const oldName = position.name;
    position.name = name; position.department = cleanName(req.body.department); position.status = validStatuses.has(req.body.status) ? req.body.status : position.status;
    // Rename every live reference, including existing applicants, interviews, and employees.
    if (oldName !== name) ['applicants', 'interviews', 'employees'].forEach((collection) => data[collection].forEach((item) => { if (item.position === oldName) item.position = name; }));
    await writeData(data);
    await logAudit({ user: req.body.adminUser || 'admin', userName: req.body.adminName || 'ผู้ดูแลระบบ', action: 'UPDATE_POSITION', details: `แก้ไขตำแหน่งงาน ${oldName} เป็น ${name}`, req });
    res.json(position);
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const index = data.positions.findIndex((p) => p.id === req.params.id);
    if (index < 0) return res.status(404).json({ error: 'ไม่พบตำแหน่งงาน' });
    const position = data.positions[index];
    const references = ['applicants', 'interviews', 'employees'].reduce((total, collection) => total + data[collection].filter((item) => item.position === position.name).length, 0);
    if (references) return res.status(409).json({ error: 'ลบไม่ได้เนื่องจากมีข้อมูลในระบบอ้างอิงตำแหน่งนี้ กรุณาปิดรับสมัครแทน' });
    data.positions.splice(index, 1);
    await writeData(data);
    await logAudit({ user: req.query.adminUser || 'admin', userName: req.query.adminName || 'ผู้ดูแลระบบ', action: 'DELETE_POSITION', details: `ลบตำแหน่งงาน ${position.name}`, req });
    res.sendStatus(204);
  } catch (error) { next(error); }
});

module.exports = router;
