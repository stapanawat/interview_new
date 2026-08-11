import React, { useState } from 'react';
import { ShieldCheck, Search, Filter, Key, Activity, Clock, User, Lock } from 'lucide-react';

export default function AuditLogView({ auditLogs }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.ip.includes(searchTerm);
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action) => {
    switch (action) {
      case 'LOGIN':
        return <span className="badge badge-confirmed"><Key size={14} /> LOGIN สำเร็จ</span>;
      case 'LOGIN_FAILED':
        return <span className="badge badge-cancelled"><ShieldCheck size={14} /> LOGIN ล้มเหลว</span>;
      case 'LOGOUT':
        return <span className="badge badge-rescheduled"><Clock size={14} /> LOGOUT</span>;
      case 'SCHEDULE_INTERVIEW':
        return <span className="badge badge-purple"><Activity size={14} /> นัดสัมภาษณ์ (12 ชม.)</span>;
      case 'UPDATE_CANDIDATE_STATUS':
        return <span className="badge badge-passed"><Activity size={14} /> เปลี่ยนสถานะผู้สมัคร</span>;
      case 'ADD_EMPLOYEE':
        return <span className="badge badge-confirmed"><User size={14} /> เพิ่มพนักงาน</span>;
      case 'EDIT_EMPLOYEE':
        return <span className="badge badge-rescheduled"><User size={14} /> แก้ไขพนักงาน</span>;
      case 'DELETE_EMPLOYEE':
        return <span className="badge badge-cancelled"><User size={14} /> ลบพนักงาน</span>;
      case 'AUTO_CANCEL_INTERVIEW_12H':
        return <span className="badge badge-cancelled"><Clock size={14} /> AUTO CANCEL (12 ชม.)</span>;
      default:
        return <span className="badge badge-purple">{action}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Banner */}
      <div className="pastel-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', color: '#2D3436', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={26} style={{ color: '#B892FF' }} />
            ประวัติการเข้าใช้งานระบบ (Audit Trail / Login History)
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#636E72', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lock size={16} /> ตามเงื่อนไขข้อ 2: มีการบันทึกประวัติทุกครั้งที่ผู้ใช้ Login เข้าสู่ระบบ และการทำรายการเปลี่ยนแปลงข้อมูลย้อนหลัง
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative', width: 260 }}>
            <input
              type="text"
              className="input-pastel"
              placeholder="ค้นหาชื่อผู้ใช้, รายละเอียด, IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 40 }}
            />
            <Search size={18} style={{ position: 'absolute', left: 14, top: 12, color: '#B2BEC3' }} />
          </div>

          <select
            className="input-pastel"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            style={{ width: 'auto', padding: '10px 16px' }}
          >
            <option value="ALL">กิจกรรมทั้งหมด</option>
            <option value="LOGIN">การ Login</option>
            <option value="SCHEDULE_INTERVIEW">การนัดสัมภาษณ์</option>
            <option value="UPDATE_CANDIDATE_STATUS">เปลี่ยนสถานะผู้สมัคร</option>
            <option value="ADD_EMPLOYEE">การบันทึกพนักงาน</option>
            <option value="AUTO_CANCEL_INTERVIEW_12H">ระบบยกเลิกอัตโนมัติ (12 ชม.)</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="pastel-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#F8F9FA', borderBottom: '2px solid #EAEAEA', color: '#4A5568' }}>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>วัน - เวลา (Timestamp)</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>ผู้ใช้งาน (User Account)</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>ประเภทกิจกรรม (Action)</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>รายละเอียดการกระทำ (Details)</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#A0AEC0' }}>
                    ไม่พบประวัติ Audit Log ในระบบ
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #F0F4F8' }}>
                    <td style={{ padding: '14px 18px', color: '#718096', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'medium' })}
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: '#2D3436' }}>
                      {log.userName}
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#A0AEC0', fontWeight: 400 }}>
                        @{log.user}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {getActionBadge(log.action)}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#4A5568', maxWidth: 420 }}>
                      {log.details}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#A0AEC0', fontFamily: 'monospace' }}>
                      {log.ip}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
