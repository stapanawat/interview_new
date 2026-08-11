import React, { useState } from 'react';
import { Calendar, CheckCircle, Clock, Search, Filter, Plus, MessageCircle, AlertCircle, ArrowRight, Mail, Phone, Wallet, Briefcase, FileText, Download, FileSpreadsheet, Car } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { toHumanError } from '../utils/errorHelper';

export default function ApplicantList({ applicants, onRefresh, onScheduleInterview, onOpenEmployeeTab, currentUser }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const filteredApplicants = applicants.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getExportRows = () => filteredApplicants.map((applicant, index) => ({
    'ลำดับ': index + 1,
    'ชื่อผู้สมัคร': applicant.name,
    'ตำแหน่ง': applicant.position,
    'อายุ': applicant.age ? `${applicant.age} ปี` : '-',
    'ยานพาหนะ': applicant.vehicle || 'ไม่มี',
    'อีเมล': applicant.email || '-',
    'เบอร์โทร': applicant.phone || '-',
    'LINE ID': applicant.lineUserId || '-',
    'สถานะ': applicant.status,
    'เงินเดือนที่คาดหวัง': Number(applicant.expectedSalary || 0),
    'ประวัติย่อ': applicant.experience || '-',
    'หมายเหตุ': applicant.notes || '-',
  }));

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(getExportRows());
    worksheet['!cols'] = [
      { wch: 8 }, { wch: 26 }, { wch: 24 }, { wch: 10 }, { wch: 20 },
      { wch: 30 }, { wch: 18 }, { wch: 20 }, { wch: 22 }, { wch: 20 },
      { wch: 38 }, { wch: 32 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ผู้สมัครงาน');
    XLSX.writeFile(workbook, `applicants-${new Date().toISOString().slice(0, 10)}.xlsx`);
    setIsExportOpen(false);
  };

  const escapeHtml = (value) => String(value ?? '-')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const downloadPdf = async () => {
    setIsExporting(true);
    setIsExportOpen(false);
    const rows = getExportRows();
    const report = document.createElement('div');
    report.style.cssText = 'position:fixed;left:-10000px;top:0;width:1120px;padding:32px;background:#fff;color:#1f2937;font-family:Arial,"Tahoma",sans-serif;';
    report.innerHTML = `
      <h1 style="margin:0 0 6px;font-size:24px;color:#2d3436;">รายงานผู้สมัครงาน</h1>
      <p style="margin:0 0 20px;color:#636e72;">จำนวน ${rows.length} รายการ • วันที่ออกรายงาน ${new Date().toLocaleDateString('th-TH')}</p>
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        <thead><tr style="background:#f3e8ff;">
          <th style="padding:9px;border:1px solid #ddd;">ชื่อผู้สมัคร</th><th style="padding:9px;border:1px solid #ddd;">ตำแหน่ง</th>
          <th style="padding:9px;border:1px solid #ddd;">อายุ</th><th style="padding:9px;border:1px solid #ddd;">ยานพาหนะ</th>
          <th style="padding:9px;border:1px solid #ddd;">อีเมล</th><th style="padding:9px;border:1px solid #ddd;">เบอร์โทร</th>
          <th style="padding:9px;border:1px solid #ddd;">LINE ID</th><th style="padding:9px;border:1px solid #ddd;">สถานะ</th>
        </tr></thead>
        <tbody>${rows.map((row) => `<tr>
          <td style="padding:8px;border:1px solid #e5e7eb;">${escapeHtml(row['ชื่อผู้สมัคร'])}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${escapeHtml(row['ตำแหน่ง'])}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${escapeHtml(row['อายุ'])}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${escapeHtml(row['ยานพาหนะ'])}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${escapeHtml(row['อีเมล'])}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${escapeHtml(row['เบอร์โทร'])}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${escapeHtml(row['LINE ID'])}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;">${escapeHtml(row['สถานะ'])}</td>
        </tr>`).join('')}</tbody>
      </table>`;
    document.body.appendChild(report);

    try {
      const canvas = await html2canvas(report, { scale: 2, backgroundColor: '#ffffff' });
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageWidth = 297;
      const pageHeight = 210;
      const margin = 10;
      const printableHeight = pageHeight - (margin * 2);
      const imageHeight = (canvas.height * pageWidth) / canvas.width;

      if (imageHeight <= printableHeight) {
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, margin, pageWidth - (margin * 2), imageHeight);
      } else {
        const sourcePageHeight = Math.floor((printableHeight * canvas.width) / (pageWidth - (margin * 2)));
        for (let offset = 0, page = 0; offset < canvas.height; offset += sourcePageHeight, page += 1) {
          if (page > 0) pdf.addPage();
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = Math.min(sourcePageHeight, canvas.height - offset);
          pageCanvas.getContext('2d').drawImage(canvas, 0, offset, canvas.width, pageCanvas.height, 0, 0, canvas.width, pageCanvas.height);
          const pageImageHeight = (pageCanvas.height * (pageWidth - (margin * 2))) / pageCanvas.width;
          pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', margin, margin, pageWidth - (margin * 2), pageImageHeight);
        }
      }
      pdf.save(`applicants-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      report.remove();
      setIsExporting(false);
    }
  };

  const handleStatusChange = async (applicantId, newStatus) => {
    setUpdatingId(applicantId);
    try {
      const res = await fetch(`/api/applicants/${applicantId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          adminUser: currentUser ? currentUser.username : 'admin',
          adminName: currentUser ? currentUser.name : 'ผู้ดูแลระบบ'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ไม่สามารถเปลี่ยนสถานะได้');

      if (data.employeeAdded) {
        alert(`อัปเดตสถานะเป็น "ผ่านการสัมภาษณ์" เรียบร้อย!\nระบบได้บันทึกคุณ ${data.employeeAdded.name} ไปยัง "หน้าจัดการพนักงาน" (เงินเดือน: ฿${data.employeeAdded.monthlySalary.toLocaleString()})`);
      }

      onRefresh();
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + toHumanError(err, 'ไม่สามารถเปลี่ยนสถานะผู้สมัครได้'));
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="badge badge-pending"><Clock size={14} /> รอการตรวจสอบ</span>;
      case 'Pending_Confirmation':
        return <span className="badge badge-purple"><Clock size={14} /> รอยืนยันนัดสัมภาษณ์ (12 ชม.)</span>;
      case 'Confirmed':
        return <span className="badge badge-confirmed"><CheckCircle size={14} /> ยืนยันสัมภาษณ์แล้ว</span>;
      case 'Rescheduled':
        return <span className="badge badge-rescheduled"><Clock size={14} /> ขอเลื่อนสัมภาษณ์</span>;
      case 'Passed':
        return <span className="badge badge-passed"><CheckCircle size={14} /> ผ่านการสัมภาษณ์ (เป็นพนักงาน)</span>;
      case 'Failed':
        return <span className="badge badge-cancelled"><AlertCircle size={14} /> ไม่ผ่านการสัมภาษณ์</span>;
      case 'Cancelled':
        return <span className="badge badge-cancelled"><AlertCircle size={14} /> ยกเลิกสิทธิ์แล้ว</span>;
      default:
        return <span className="badge badge-pending">{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Filter Controls */}
      <div className="pastel-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 280 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="input-pastel"
              placeholder="ค้นหาชื่อผู้สมัคร, ตำแหน่งงาน, หรืออีเมล..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 40 }}
            />
            <Search size={18} style={{ position: 'absolute', left: 14, top: 12, color: '#B2BEC3' }} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Filter size={18} style={{ color: '#636E72' }} />
          <select
            className="input-pastel"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto', padding: '10px 16px' }}
          >
            <option value="ALL">สถานะทั้งหมด</option>
            <option value="Pending">รอการตรวจสอบ (Pending)</option>
            <option value="Pending_Confirmation">รอยืนยันสัมภาษณ์ (12 ชม.)</option>
            <option value="Confirmed">ยืนยันวันสัมภาษณ์แล้ว</option>
            <option value="Passed">ผ่านการคัดเลือก (Passed)</option>
            <option value="Cancelled">ยกเลิกนัดหมาย (Cancelled)</option>
          </select>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="btn-pastel btn-pastel-secondary"
              onClick={() => setIsExportOpen((isOpen) => !isOpen)}
              disabled={isExporting}
              aria-expanded={isExportOpen}
            >
              <Download size={18} />
              {isExporting ? 'กำลังสร้าง PDF...' : 'Export'}
            </button>
            {isExportOpen && (
              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 20, minWidth: 190, padding: 8, borderRadius: 12, background: 'white', border: '1px solid #E2E8F0', boxShadow: '0 10px 24px rgba(45, 52, 54, 0.14)' }}>
                <button type="button" className="export-option" onClick={downloadExcel}>
                  <FileSpreadsheet size={17} color="#217346" /> ดาวน์โหลด Excel
                </button>
                <button type="button" className="export-option" onClick={downloadPdf}>
                  <FileText size={17} color="#D63031" /> ดาวน์โหลด PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Applicants List Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
        {filteredApplicants.map((applicant) => (
          <div key={applicant.id} className="pastel-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#2D3436', margin: 0 }}>
                    {applicant.name}
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: '#7A52C7', fontWeight: 500 }}>
                    {applicant.position}
                  </span>
                </div>
                {getStatusBadge(applicant.status)}
              </div>

              <div style={{ background: '#F8F9FA', borderRadius: 12, padding: 12, fontSize: '0.85rem', color: '#636E72', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Calendar size={15} /><span><b>อายุ:</b> {applicant.age ? `${applicant.age} ปี` : 'ไม่ได้ระบุ'}</span></div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Car size={15} /><span><b>ยานพาหนะ:</b> {applicant.vehicle || 'ไม่มี'}</span></div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Mail size={15} /><span><b>อีเมล:</b> {applicant.email || 'ไม่ได้ระบุ'}</span></div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Phone size={15} /><span><b>เบอร์โทร:</b> {applicant.phone}</span></div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Wallet size={15} /><span><b>เงินเดือนที่คาดหวัง:</b> ฿{Number(applicant.expectedSalary).toLocaleString()} /เดือน</span></div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><MessageCircle size={15} /><span><b>LINE Display Name:</b> {applicant.lineDisplayName} (ID: {applicant.lineUserId})</span></div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Briefcase size={15} /><span><b>ประวัติย่อ:</b> {applicant.experience}</span></div>
                {applicant.notes && (
                  <div style={{ marginTop: 4, background: '#FFF8E1', color: '#F57F17', padding: '6px 10px', borderRadius: 8, fontSize: '0.8rem' }}>
                    <FileText size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} /><b>หมายเหตุ:</b> {applicant.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Actions Footer */}
            <div style={{ borderTop: '1px solid #F0F0F0', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: '0.8rem', color: '#636E72', fontWeight: 500 }}>เปลี่ยนสถานะผู้สมัคร:</span>
                <select
                  className="input-pastel"
                  value={applicant.status}
                  onChange={(e) => handleStatusChange(applicant.id, e.target.value)}
                  disabled={updatingId === applicant.id}
                  style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
                >
                  <option value="Pending">รอตรวจสอบ</option>
                  <option value="Pending_Confirmation">รอยืนยันสัมภาษณ์</option>
                  <option value="Confirmed">ยืนยันสัมภาษณ์</option>
                  <option value="Passed">ผ่าน (ย้ายไปหน้าจัดการพนักงาน)</option>
                  <option value="Failed">ไม่ผ่าน</option>
                  <option value="Cancelled">ยกเลิก</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => onScheduleInterview(applicant)}
                  className="btn-pastel btn-pastel-primary"
                  style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
                >
                  <Calendar size={16} />
                  นัดสัมภาษณ์ (LINE Notification)
                </button>

                {applicant.status === 'Passed' && (
                  <button
                    onClick={onOpenEmployeeTab}
                    className="btn-pastel btn-pastel-success"
                    style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                    title="ไปที่หน้าจัดการพนักงาน"
                  >
                    ดูหน้าพนักงาน <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
