import React, { useState } from 'react';
import { UserCheck, Plus, Edit, Trash2, Search, DollarSign, Mail, Phone, FileText, CheckCircle2, User } from 'lucide-react';

export default function EmployeeManagement({ employees, onRefresh, currentUser }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [monthlySalary, setMonthlySalary] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('Active');
  const [loading, setLoading] = useState(false);

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.phone.includes(searchTerm) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingEmployee(null);
    setName('');
    setEmail('');
    setPhone('');
    setPosition('');
    setMonthlySalary('');
    setNotes('');
    setStatus('Active');
    setIsModalOpen(true);
  };

  const openEditModal = (emp) => {
    setEditingEmployee(emp);
    setName(emp.name);
    setEmail(emp.email || '');
    setPhone(emp.phone);
    setPosition(emp.position);
    setMonthlySalary(emp.monthlySalary ? emp.monthlySalary.toString() : '');
    setNotes(emp.notes || '');
    setStatus(emp.status || 'Active');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name,
        email,
        phone,
        position: position || 'พนักงานทั่วไป',
        monthlySalary: Number(monthlySalary) || 0,
        notes,
        status,
        adminUser: currentUser ? currentUser.username : 'admin',
        adminName: currentUser ? currentUser.name : 'ผู้ดูแลระบบ'
      };

      let res;
      if (editingEmployee) {
        res = await fetch(`/api/employees/${editingEmployee.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ไม่สามารถบันทึกข้อมูลพนักงานได้');

      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (empId, empName) => {
    if (!confirm(`คุณต้องการลบข้อมูลพนักงาน "${empName}" ออกจากระบบใช่หรือไม่?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/employees/${empId}?adminUser=${currentUser ? currentUser.username : 'admin'}&adminName=${encodeURIComponent(currentUser ? currentUser.name : 'ผู้ดูแลระบบ')}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ไม่สามารถลบข้อมูลพนักงานได้');

      onRefresh();
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Banner & Action Controls */}
      <div className="pastel-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', color: '#2D3436', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserCheck size={26} style={{ color: '#55E6C1' }} />
            หน้าจัดการพนักงาน (Employee Directory)
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#636E72', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileText size={16} /> แสดงรายชื่อ, อีเมล, เบอร์โทร, เงินเดือนรายเดือน และรายละเอียดเพิ่มเติม (บันทึกข้อมูลและแก้ไขได้แบบ Real-time)
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative', width: 260 }}>
            <input
              type="text"
              className="input-pastel"
              placeholder="ค้นหาชื่อ, เบอร์โทร, อีเมล..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 40 }}
            />
            <Search size={18} style={{ position: 'absolute', left: 14, top: 12, color: '#B2BEC3' }} />
          </div>

          <button onClick={openAddModal} className="btn-pastel btn-pastel-success">
            <Plus size={18} />
            เพิ่มพนักงานใหม่
          </button>
        </div>
      </div>

      {/* Main Employee Table */}
      <div className="pastel-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#F8F9FA', borderBottom: '2px solid #EAEAEA', color: '#4A5568' }}>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>รายชื่อพนักงาน (Name)</th>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>ตำแหน่ง (Position)</th>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>อีเมล (Email)</th>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>เบอร์โทร (Phone)</th>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>เงินเดือนรายเดือน (Monthly Salary)</th>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>รายละเอียดเพิ่มเติม (Notes)</th>
                <th style={{ padding: '16px 20px', fontWeight: 600, textAlign: 'center' }}>จัดการ (Actions)</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 30, textAlign: 'center', color: '#A0AEC0' }}>
                    ไม่พบข้อมูลพนักงานในระบบ
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, idx) => (
                  <tr
                    key={emp.id}
                    style={{
                      borderBottom: '1px solid #F0F4F8',
                      background: idx % 2 === 0 ? 'white' : 'rgba(248, 249, 250, 0.5)',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    {/* 1. รายชื่อ */}
                    <td style={{ padding: '16px 20px', fontWeight: 600, color: '#2D3436' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #B892FF 0%, #70A1FF 100%)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          fontSize: '0.85rem'
                        }}>
                          {emp.name ? emp.name.charAt(0) : 'E'}
                        </div>
                        <div>
                          {emp.name}
                          {emp.sourceApplicantId && (
                            <span style={{ display: 'block', fontSize: '0.7rem', color: '#2E7D32', fontWeight: 400 }}>
                              ✨ บรรจุจากใบสมัครงาน (LINE)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* ตำแหน่ง */}
                    <td style={{ padding: '16px 20px', color: '#7A52C7', fontWeight: 500 }}>
                      {emp.position}
                    </td>

                    {/* 2. อีเมล */}
                    <td style={{ padding: '16px 20px', color: '#4A5568' }}>
                      {emp.email ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Mail size={14} style={{ color: '#70A1FF' }} />
                          {emp.email}
                        </div>
                      ) : (
                        <span style={{ color: '#A0AEC0' }}>-</span>
                      )}
                    </td>

                    {/* 3. เบอร์โทร */}
                    <td style={{ padding: '16px 20px', color: '#4A5568', fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Phone size={14} style={{ color: '#20BF6B' }} />
                        {emp.phone}
                      </div>
                    </td>

                    {/* 4. รายเดือน */}
                    <td style={{ padding: '16px 20px', color: '#2E7D32', fontWeight: 600, fontSize: '0.95rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <DollarSign size={16} style={{ color: '#2E7D32' }} />
                        ฿{Number(emp.monthlySalary || 0).toLocaleString()} /เดือน
                      </div>
                    </td>

                    {/* 5. ช่องกรอก รายละเอียดเพิ่มเติม */}
                    <td style={{ padding: '16px 20px', color: '#718096', maxWidth: 280 }}>
                      <div style={{
                        background: '#FFF8E1',
                        border: '1px solid #FFE082',
                        color: '#E65100',
                        padding: '6px 12px',
                        borderRadius: 10,
                        fontSize: '0.82rem',
                        lineHeight: 1.4
                      }}>
                        {emp.notes || 'ไม่มีรายละเอียดเพิ่มเติม'}
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <button
                          onClick={() => openEditModal(emp)}
                          className="btn-pastel btn-pastel-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                          title="แก้ไขรายละเอียด"
                        >
                          <Edit size={14} /> แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id, emp.name)}
                          className="btn-pastel btn-pastel-danger"
                          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                          title="ลบข้อมูลพนักงาน"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Employee Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <h3 style={{ fontSize: '1.25rem', color: '#2D3436', fontWeight: 600, marginBottom: 16 }}>
              {editingEmployee ? '✏️ แก้ไขข้อมูลพนักงาน' : '➕ เพิ่มข้อมูลพนักงานใหม่'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label>รายชื่อพนักงาน *</label>
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
                  <label>ตำแหน่งงาน *</label>
                  <input
                    type="text"
                    className="input-pastel"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="กรอกตำแหน่งงาน"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label>อีเมล (Email)</label>
                  <input
                    type="email"
                    className="input-pastel"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                  />
                </div>

                <div className="form-group">
                  <label>เบอร์โทรศัพท์ (Phone) *</label>
                  <input
                    type="tel"
                    className="input-pastel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="กรอกเบอร์โทรศัพท์"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>อัตราเงินเดือนรายเดือน (Monthly Salary - บาท) *</label>
                <input
                  type="number"
                  className="input-pastel"
                  value={monthlySalary}
                  onChange={(e) => setMonthlySalary(e.target.value)}
                  placeholder="กรอกจำนวนเงินเดือน"
                  required
                />
              </div>

              <div className="form-group">
                <label>รายละเอียดเพิ่มเติม (Notes / Remarks)</label>
                <textarea
                  className="input-pastel"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ระบุสวัสดิการ, รายละเอียดสัญญา หรือข้อความเพิ่มเติม..."
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="button" className="btn-pastel btn-pastel-secondary" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn-pastel btn-pastel-primary" disabled={loading} style={{ flex: 1.5 }}>
                  {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูลพนักงาน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
