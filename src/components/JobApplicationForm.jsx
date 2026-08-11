import React, { useEffect, useState } from 'react';
import { Send, Sparkles, CheckCircle2, User, Mail, Phone, Briefcase, DollarSign, Award, FileText, Calendar, Car } from 'lucide-react';
import { toHumanError } from '../utils/errorHelper';

export default function JobApplicationForm({ lineUserId, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [positions, setPositions] = useState([]);
  const [expectedSalary, setExpectedSalary] = useState('');
  const [age, setAge] = useState('');
  const [vehicle, setVehicle] = useState('ไม่มี');
  const [experience, setExperience] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch('/api/positions')
      .then((res) => res.ok ? res.json() : [])
      .then((items) => setPositions(items.filter((item) => item.status === 'Open')))
      .catch(() => setPositions([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const finalPosition = position;

    try {
      const res = await fetch('/api/applicants/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          position: finalPosition,
          expectedSalary: Number(expectedSalary) || 0,
          age: age ? Number(age) : null,
          vehicle: vehicle || 'ไม่มี',
          lineUserId: lineUserId || `LINE-${Math.floor(100000 + Math.random() * 900000)}`,
          lineDisplayName: name,
          experience,
          notes
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ไม่สามารถส่งใบสมัครได้');

      setSubmitted(true);
      setTimeout(() => {
        if (onSuccess) onSuccess(data.applicant);
      }, 1400);
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + toHumanError(err, 'ไม่สามารถส่งใบสมัครงานได้'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay job-modal-overlay" onClick={onClose}>
      <div className="modal-content job-modal-content" onClick={(e) => e.stopPropagation()}>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 10px' }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: '#E8F5E9',
              color: '#2E7D32',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12
            }}>
              <CheckCircle2 size={34} />
            </div>
            <h2 style={{ fontSize: '1.35rem', color: '#2D3436', fontWeight: 600 }}>ส่งแบบฟอร์มใบสมัครงานเรียบร้อย!</h2>
            <p style={{ color: '#636E72', marginTop: 6, lineHeight: 1.5, fontSize: '0.88rem' }}>
              ระบบได้บันทึกข้อมูลใบสมัครเรียบร้อยแล้ว <br />
              และส่งข้อความยืนยันการรับสมัครกลับไปยัง LINE แล้วค่ะ
            </p>
            <div style={{ marginTop: 18 }}>
              <button
                type="button"
                className="btn-pastel btn-pastel-primary"
                onClick={onClose}
                style={{ padding: '8px 20px', fontSize: '0.9rem' }}
              >
                เสร็จสิ้น / ปิดหน้านี้
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #FFBE76 0%, #B892FF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                flexShrink: 0
              }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', color: '#2D3436', fontWeight: 600, margin: 0 }}>แบบฟอร์มสมัครงาน (Job Application Form)</h2>
                <p style={{ fontSize: '0.78rem', color: '#636E72', margin: 0 }}>กรอกข้อมูลสมัครงานเพื่อบันทึกเข้าสู่ระบบและแจ้ง HR ตรวจสอบทันที</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Section 1: ข้อมูลส่วนตัวและการติดต่อ */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7A52C7', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <User size={14} /> ข้อมูลส่วนตัวและการติดต่อ
                </div>
                <div className="job-form-grid">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 500, color: '#2D3436' }}><User size={12} style={{ display: 'inline', marginRight: 3 }} /> ชื่อ - นามสกุล *</label>
                    <input
                      type="text"
                      className="input-pastel"
                      style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                      value={name}
                      disabled={loading}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="กรอกชื่อ - นามสกุล"
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 500, color: '#2D3436' }}><Phone size={12} style={{ display: 'inline', marginRight: 3 }} /> เบอร์โทรศัพท์ *</label>
                    <input
                      type="tel"
                      className="input-pastel"
                      style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                      value={phone}
                      disabled={loading}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="กรอกเบอร์โทรศัพท์ติดต่อ"
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 500, color: '#2D3436' }}><Mail size={12} style={{ display: 'inline', marginRight: 3 }} /> อีเมล</label>
                    <input
                      type="email"
                      className="input-pastel"
                      style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                      value={email}
                      disabled={loading}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 500, color: '#2D3436' }}><Calendar size={12} style={{ display: 'inline', marginRight: 3 }} /> อายุ (ปี)</label>
                    <input
                      type="number"
                      min="15"
                      max="99"
                      className="input-pastel"
                      style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                      value={age}
                      disabled={loading}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="เช่น 25"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: ข้อมูลการทำงานและความพร้อม */}
              <div style={{ marginBottom: 8, paddingTop: 6, borderTop: '1px dashed #E2E8F0' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7A52C7', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Briefcase size={14} /> ข้อมูลการทำงานและความพร้อม
                </div>
                <div className="job-form-grid">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 500, color: '#2D3436' }}><Briefcase size={12} style={{ display: 'inline', marginRight: 3 }} /> ตำแหน่งงานที่สนใจ *</label>
                    <select
                      className="input-pastel"
                      style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                      value={position}
                      disabled={loading}
                      onChange={(e) => setPosition(e.target.value)}
                      required
                    >
                      <option value="">-- เลือกตำแหน่งงาน --</option>
                      {positions.map((item) => <option key={item.id} value={item.name}>{item.name}{item.department ? ` — ${item.department}` : ''}</option>)}
                    </select>
                    {positions.length === 0 && <small style={{ color: '#D35400', fontSize: '0.72rem' }}>ยังไม่มีตำแหน่งที่เปิดรับสมัคร</small>}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 500, color: '#2D3436' }}><DollarSign size={12} style={{ display: 'inline', marginRight: 3 }} /> เงินเดือนที่คาดหวัง (บาท) *</label>
                    <input
                      type="number"
                      className="input-pastel"
                      style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                      value={expectedSalary}
                      disabled={loading}
                      onChange={(e) => setExpectedSalary(e.target.value)}
                      placeholder="เช่น 35000"
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 500, color: '#2D3436' }}><Car size={12} style={{ display: 'inline', marginRight: 3 }} /> ยานพาหนะส่วนตัว</label>
                    <select
                      className="input-pastel"
                      style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                      value={vehicle}
                      disabled={loading}
                      onChange={(e) => setVehicle(e.target.value)}
                    >
                      <option value="ไม่มี">ไม่มี (None)</option>
                      <option value="รถจักรยานยนต์">รถจักรยานยนต์ (Motorcycle)</option>
                      <option value="รถยนต์">รถยนต์ (Car)</option>
                      <option value="รถจักรยานยนต์ และ รถยนต์">รถจักรยานยนต์ และ รถยนต์</option>
                      <option value="อื่นๆ">อื่นๆ</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 500, color: '#2D3436' }}><Award size={12} style={{ display: 'inline', marginRight: 3 }} /> ประวัติการทำงานสรุป</label>
                    <input
                      type="text"
                      className="input-pastel"
                      style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                      value={experience}
                      disabled={loading}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="ระบุประสบการณ์โดยย่อ..."
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: รายละเอียดเพิ่มเติม */}
              <div style={{ marginBottom: 10, paddingTop: 6, borderTop: '1px dashed #E2E8F0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 500, color: '#2D3436' }}><FileText size={12} style={{ display: 'inline', marginRight: 3 }} /> รายละเอียดเพิ่มเติม / ทักษะความสามารถ</label>
                  <input
                    type="text"
                    className="input-pastel"
                    style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                    value={notes}
                    disabled={loading}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="ทักษะความสามารถ หรือวันพร้อมเริ่มงาน..."
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn-pastel btn-pastel-secondary" onClick={onClose} disabled={loading} style={{ flex: 1, padding: '8px 14px', fontSize: '0.85rem' }}>
                  ปิดหน้าต่าง
                </button>
                <button type="submit" className="btn-pastel btn-pastel-success" disabled={loading} style={{ flex: 1.5, padding: '8px 14px', fontSize: '0.85rem' }}>
                  <Send size={15} />
                  {loading ? 'กำลังส่งข้อมูล...' : 'ส่งใบสมัครงาน'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
