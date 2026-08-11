import React, { useState } from 'react';
import { Briefcase, Edit, Plus, Trash2, Edit2, CheckCircle2, RefreshCw } from 'lucide-react';
import { toHumanError } from '../utils/errorHelper';
import { showConfirmAlert, showErrorAlert } from '../utils/swal';

const blankPosition = { name: '', department: '', status: 'Open' };

export default function PositionManagement({ positions, onRefresh, currentUser }) {
  const [form, setForm] = useState(blankPosition);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const reset = () => { setForm(blankPosition); setEditingId(null); };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/positions/${editingId}` : '/api/positions';
      const response = await fetch(url, { method: editingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, adminUser: currentUser?.username, adminName: currentUser?.name }) });
      const data = response.status === 204 ? null : await response.json();
      if (!response.ok) throw new Error(data?.error || 'ไม่สามารถบันทึกตำแหน่งงานได้');
      reset(); onRefresh();
    } catch (error) { showErrorAlert('เกิดข้อผิดพลาด', toHumanError(error, 'ไม่สามารถบันทึกตำแหน่งงานได้')); } finally { setSaving(false); }
  };

  const remove = async (item) => {
    const isConfirmed = await showConfirmAlert('ยืนยันการลบตำแหน่งงาน', `ลบตำแหน่ง “${item.name}” ใช่หรือไม่?`);
    if (!isConfirmed) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/positions/${item.id}?adminUser=${encodeURIComponent(currentUser?.username || 'admin')}`, { method: 'DELETE' });
      if (!response.ok) { const data = await response.json(); throw new Error(data.error || 'ไม่สามารถลบตำแหน่งงานได้'); }
      onRefresh();
    } catch (error) { showErrorAlert('เกิดข้อผิดพลาด', toHumanError(error, 'ไม่สามารถลบตำแหน่งงานได้')); } finally { setSaving(false); }
  };

  return <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, .8fr) minmax(400px, 1.2fr)', gap: 20, alignItems: 'start' }}>
    <form className="pastel-card" onSubmit={submit}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><Briefcase size={24} color="#7A52C7" /> {editingId ? 'แก้ไขตำแหน่งงาน' : 'เพิ่มตำแหน่งงาน'}</h2>
      <p style={{ color: '#636E72', fontSize: '.85rem', marginBottom: 18 }}>รายการนี้เป็นแหล่งข้อมูลกลางสำหรับฟอร์มสมัครงานและข้อมูลพนักงาน</p>
      <div className="form-group"><label>ชื่อตำแหน่ง *</label><input className="input-pastel" disabled={saving} value={form.name} onChange={(e) => update('name', e.target.value)} required /></div>
      <div className="form-group"><label>แผนก</label><input className="input-pastel" disabled={saving} value={form.department} onChange={(e) => update('department', e.target.value)} placeholder="เช่น Technology" /></div>
      <div className="form-group"><label>สถานะรับสมัคร</label><select className="input-pastel" disabled={saving} value={form.status} onChange={(e) => update('status', e.target.value)}><option value="Open">เปิดรับสมัคร</option><option value="Closed">ปิดรับสมัคร</option></select></div>
      <div style={{ display: 'flex', gap: 8 }}><button className="btn-pastel btn-pastel-primary" disabled={saving} type="submit"><Plus size={16} />{saving ? 'กำลังบันทึก...' : editingId ? 'บันทึก' : 'เพิ่มตำแหน่ง'}</button>{editingId && <button className="btn-pastel btn-pastel-secondary" disabled={saving} type="button" onClick={reset}>ยกเลิก</button>}</div>
    </form>
    <div className="pastel-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '20px 22px', borderBottom: '1px solid #EAEAEA' }}><h2 style={{ fontSize: '1.2rem' }}>ตำแหน่งงานทั้งหมด ({positions.length})</h2></div>
      {positions.map((item) => <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '16px 22px', borderBottom: '1px solid #F0F4F8' }}>
        <Briefcase size={19} color="#7A52C7" /><div style={{ flex: 1 }}><b>{item.name}</b><div style={{ fontSize: '.8rem', color: '#636E72' }}>{item.department || 'ไม่ระบุแผนก'}</div></div>
        <span className={`badge ${item.status === 'Open' ? 'badge-confirmed' : 'badge-cancelled'}`}>{item.status === 'Open' ? 'เปิดรับสมัคร' : 'ปิดรับสมัคร'}</span>
        <button className="btn-pastel btn-pastel-secondary" disabled={saving} style={{ padding: '6px 9px' }} onClick={() => { setEditingId(item.id); setForm({ name: item.name, department: item.department || '', status: item.status }); }}><Edit size={15} /></button>
        <button className="btn-pastel btn-pastel-danger" disabled={saving} style={{ padding: '6px 9px' }} onClick={() => remove(item)}><Trash2 size={15} /></button>
      </div>)}
      {!positions.length && <p style={{ padding: 24, color: '#636E72' }}>ยังไม่มีตำแหน่งงาน</p>}
    </div>
  </div>;
}
