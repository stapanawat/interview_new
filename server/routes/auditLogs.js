const express = require('express');
const router = express.Router();
const { readData } = require('../db');

// GET audit logs
router.get('/', async (req, res, next) => {
  try {
    const data = await readData();
    res.json(data.auditLogs);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
