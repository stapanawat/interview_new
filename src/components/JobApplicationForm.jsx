import React, { useState } from 'react';
import { Send, Sparkles, CheckCircle2, User, Mail, Phone, Briefcase, DollarSign, Award, FileText } from 'lucide-react';

export default function JobApplicationForm({ lineUserId, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [customPosition, setCustomPosition] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [experience, setExperience] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const finalPosition = position === 'OTHER' ? customPosition : (position || 'พนักงานทั่วไป');

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
      alert('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{
              width: 70,
              height: 70,
              borderRadius: '50%',
              background: '#E8F5E9',
              color: '#2E7D32',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <CheckCircle2 size={40} />
            </div>
            <h2 style={{ fontSize: '1.5rem', color: '#2D3436', fontWeight: 600 }}>ส่งแบบฟอร์มใบสมัครงานเรียบร้อย!</h2>
            <p style={{ color: '#636E72', marginTop: 8 }}>
              ระบบได้บันทึกข้อมูลใบสมัครเข้าสู่ Web Dashboard เรียบร้อยแล้ว <br />
              และส่งข้อความยืนยันการรับสมัครกลับไปยัง LINE แล้วค่ะ
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                background: 'linear-gradient(135deg, #FFBE76 0%, #B892FF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <Sparkles size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', color: '#2D3436', fontWeight: 600, margin: 0 }}>แบบฟอร์มสมัครงาน (Job Application Form)</h2>
                <p style={{ fontSize: '0.82rem', color: '#636E72', margin: 0 }}>กรอกข้อมูลสมัครงานจริง ระบบจะบันทึกข้อมูลลงฐานข้อมูลระบบและแจ้ง HR ตรวจสอบทันที</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label><User size={14} style={{ display: 'inline', marginRight: 4 }} /> ชื่อ - นามสกุล *</label>
                  <input
                    type="text"
                    className="input-pastel"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="กรอกชื่อ - นามสกุล"
                    required
                  />
                </div>

                <div className="form-group">
                  <label><Phone size={14} style={{ display: 'inline', marginRight: 4 }} /> เบอร์โทรศัพท์ *</label>
                  <input
                    type="tel"
                    className="input-pastel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="กรอกเบอร์โทรศัพท์ติดต่อ"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label><Mail size={14} style={{ display: 'inline', marginRight: 4 }} /> อีเมล</label>
                  <input
                    type="email"
                    className="input-pastel"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>

                <div className="form-group">
                  <label><Briefcase size={14} style={{ display: 'inline', marginRight: 4 }} /> ตำแหน่งงานที่สนใจ *</label>
                  <select
                    className="input-pastel"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    required
                  >
                    <option value="">-- เลือกตำแหน่งงาน --</option>
                    <option value="Senior Frontend Developer">Senior Frontend Developer</option>
                    <option value="Fullstack Developer">Fullstack Developer</option>
                    <option value="UX/UI Designer">UX/UI Designer</option>
                    <option value="Backend Tech Lead">Backend Tech Lead</option>
                    <option value="HR & Admin Specialist">HR & Admin Specialist</option>
                    <option value="OTHER">ระบุตำแหน่งงานอื่น...</option>
                  </select>
                </div>
              </div>

              {position === 'OTHER' && (
                <div className="form-group">
                  <label>ระบุตำแหน่งงานอื่นๆ *</label>
                  <input
                    type="text"
                    className="input-pastel"
                    value={customPosition}
                    onChange={(e) => setCustomPosition(e.target.value)}
                    placeholder="เช่น Marketing Manager, Graphic Designer..."
                    required
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label><DollarSign size={14} style={{ display: 'inline', marginRight: 4 }} /> เงินเดือนที่คาดหวัง (บาท/เดือน) *</label>
                  <input
                    type="number"
                    className="input-pastel"
                    value={expectedSalary}
                    onChange={(e) => setExpectedSalary(e.target.value)}
                    placeholder="เช่น 35000"
                    required
                  />
                </div>

                <div className="form-group">
                  <label><Award size={14} style={{ display: 'inline', marginRight: 4 }} /> ประวัติการทำงานสรุป</label>
                  <input
                    type="text"
                    className="input-pastel"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="ระบุประสบการณ์ทำงานโดยย่อ..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label><FileText size={14} style={{ display: 'inline', marginRight: 4 }} /> รายละเอียดเพิ่มเติม</label>
                <textarea
                  className="input-pastel"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ทักษะความสามารถ หรือวันพร้อมเริ่มงาน..."
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="button" className="btn-pastel btn-pastel-secondary" onClick={onClose} style={{ flex: 1 }}>
                  ปิดหน้าต่าง
                </button>
                <button type="submit" className="btn-pastel btn-pastel-success" disabled={loading} style={{ flex: 1.5 }}>
                  <Send size={18} />
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
