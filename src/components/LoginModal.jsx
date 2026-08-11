import React, { useState } from 'react';
import { Lock, User, ShieldAlert, CheckCircle2, KeyRound, UserPlus } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('HR Specialist');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login' 
        ? { username, password }
        : { username, password, name, role };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'การทำรายการล้มเหลว');
      }

      if (mode === 'register') {
        setSuccessMsg(`สมัครสมาชิกสำเร็จ! กำลังเข้าสู่ระบบในฐานะ ${data.user.name}...`);
        // Auto login after register
        setTimeout(() => {
          onLoginSuccess(data.user);
          onClose();
        }, 1000);
      } else {
        setSuccessMsg(`เข้าสู่ระบบสำเร็จ (${data.user.name})`);
        setTimeout(() => {
          onLoginSuccess(data.user);
          onClose();
        }, 800);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
        {/* Toggle Mode Header */}
        <div style={{ display: 'flex', background: '#F0F4F8', borderRadius: 14, padding: 4, marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 10,
              border: 'none',
              background: mode === 'login' ? 'white' : 'transparent',
              color: mode === 'login' ? '#2D3436' : '#636E72',
              fontWeight: mode === 'login' ? 600 : 400,
              cursor: 'pointer',
              boxShadow: mode === 'login' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            เข้าสู่ระบบ (Login)
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 10,
              border: 'none',
              background: mode === 'register' ? 'white' : 'transparent',
              color: mode === 'register' ? '#2D3436' : '#636E72',
              fontWeight: mode === 'register' ? 600 : 400,
              cursor: 'pointer',
              boxShadow: mode === 'register' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            สมัครสมาชิกใหม่ (Register)
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #B892FF 0%, #70A1FF 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            marginBottom: 12,
            boxShadow: '0 8px 24px rgba(184, 146, 255, 0.4)'
          }}>
            {mode === 'login' ? <KeyRound size={28} /> : <UserPlus size={28} />}
          </div>
          <h2 style={{ fontSize: '1.4rem', color: '#2D3436', fontWeight: 600 }}>
            {mode === 'login' ? 'เข้าสู่ระบบบัญชีผู้ใช้' : 'ลงทะเบียนบัญชีใหม่'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#636E72', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Lock size={16} /> บันทึกประวัติกิจกรรมและการสลับบัญชี (Audit Log) ในระบบย้อนหลัง
          </p>
        </div>

        {error && (
          <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', color: '#C62828', padding: '10px 14px', borderRadius: 12, fontSize: '0.85rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldAlert size={18} />
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{ background: '#E8F5E9', border: '1px solid #C8E6C9', color: '#2E7D32', padding: '10px 14px', borderRadius: 12, fontSize: '0.85rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={18} />
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <div className="form-group">
                <label>ชื่อ - นามสกุล ผู้ใช้งาน *</label>
                <input
                  type="text"
                  className="input-pastel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น สมชาย รักษ์ดี"
                  required
                />
              </div>

              <div className="form-group">
                <label>ตำแหน่ง / บทบาทในระบบ</label>
                <select
                  className="input-pastel"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="HR Manager">HR Manager</option>
                  <option value="HR Specialist">HR Specialist</option>
                  <option value="Recruiter">Recruiter</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label>ชื่อผู้ใช้งาน (Username) *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input-pastel"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ระบุชื่อผู้ใช้งาน"
                required
                style={{ paddingLeft: 40 }}
              />
              <User size={18} style={{ position: 'absolute', left: 14, top: 14, color: '#B2BEC3' }} />
            </div>
          </div>

          <div className="form-group">
            <label>รหัสผ่าน (Password) *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="input-pastel"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ระบุรหัสผ่าน"
                required
                style={{ paddingLeft: 40 }}
              />
              <Lock size={18} style={{ position: 'absolute', left: 14, top: 14, color: '#B2BEC3' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button type="button" className="btn-pastel btn-pastel-secondary" onClick={onClose} style={{ flex: 1 }}>
              ยกเลิก
            </button>
            <button type="submit" className="btn-pastel btn-pastel-primary" disabled={loading} style={{ flex: 1.5 }}>
              {loading ? 'กำลังดำเนินการ...' : mode === 'login' ? 'เข้าสู่ระบบ' : 'ลงทะเบียนและเข้าใช้'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
