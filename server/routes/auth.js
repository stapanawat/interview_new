const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../db');
const { logAudit } = require('../auditLogger');

// Login endpoint with audit logging
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const data = await readData();

  const user = data.users.find(u => u.username === username && u.password === password);
  if (!user) {
    await logAudit({
      user: username || 'unknown',
      userName: 'พยายามเข้าสู่ระบบ',
      action: 'LOGIN_FAILED',
      details: `การเข้าสู่ระบบล้มเหลว (ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง: ${username})`,
      req
    });
    return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
  }

  // Record audit log on successful login
  const auditLog = await logAudit({
    user: user.username,
    userName: user.name,
    action: 'LOGIN',
    details: `เข้าสู่ระบบสำเร็จในฐานะ ${user.role} (${user.name})`,
    req
  });

  res.json({
    message: 'เข้าสู่ระบบสำเร็จ',
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      avatar: user.avatar
    },
    auditLog
  });
});

// Register new real HR user endpoint
router.post('/register', async (req, res) => {
  const { username, password, name, role } = req.body;
  
  if (!username || !password || !name) {
    return res.status(400).json({ error: 'กรุณากรอก ชื่อผู้ใช้, รหัสผ่าน และชื่อ-นามสกุล ให้ครบถ้วน' });
  }

  const data = await readData();
  const existing = data.users.find(u => u.username === username);
  if (existing) {
    return res.status(400).json({ error: 'ชื่อผู้ใช้งานนี้มีอยู่ในระบบแล้ว' });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    username,
    password,
    name,
    role: role || 'HR Specialist',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`
  };

  data.users.push(newUser);
  await writeData(data);

  await logAudit({
    user: username,
    userName: name,
    action: 'REGISTER_USER',
    details: `ลงทะเบียนผู้ใช้งานใหม่ในระบบ (${role || 'HR Specialist'})`,
    req
  });

  res.status(201).json({
    message: 'ลงทะเบียนผู้ใช้ใหม่สำเร็จ',
    user: {
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      role: newUser.role,
      avatar: newUser.avatar
    }
  });
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  const { username, userName } = req.body;
  await logAudit({
    user: username || 'admin',
    userName: userName || 'ผู้ดูแลระบบ',
    action: 'LOGOUT',
    details: 'ออกจากระบบเรียบร้อยแล้ว',
    req
  });
  res.json({ message: 'ออกจากระบบสำเร็จ' });
});

module.exports = router;
