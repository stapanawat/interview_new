import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import LineSimulator from './components/LineSimulator';
import JobApplicationForm from './components/JobApplicationForm';
import ApplicantList from './components/ApplicantList';
import InterviewScheduleView from './components/InterviewScheduleView';
import EmployeeManagement from './components/EmployeeManagement';
import AuditLogView from './components/AuditLogView';
import PositionManagement from './components/PositionManagement';

import { Users, Calendar, UserCheck, ShieldCheck, Plus, Sparkles, Clock, CheckCircle2, HeartHandshake } from 'lucide-react';

function AdminApp() {
  const [activeTab, setActiveTab] = useState('applicants');
  const [currentUser, setCurrentUser] = useState(null); /*
    id: 'usr-1',
    username: 'admin',
    name: 'สมชาย ใจดี (HR Manager)',
    role: 'Super Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  }); */

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLineUserId, setSelectedLineUserId] = useState('');

  // Schedule Interview Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [targetApplicant, setTargetApplicant] = useState(null);
  const [interviewDate, setInterviewDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('14:00 - 15:00');
  const [format, setFormat] = useState('Online (Google Meet)');
  const [locationOrLink, setLocationOrLink] = useState('https://meet.google.com/pastel-hr-room');
  const [scheduling, setScheduling] = useState(false);

  // Data Store States
  const [applicants, setApplicants] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [positions, setPositions] = useState([]);

  const loadAllData = async () => {
    try {
      const [resApp, resInt, resEmp, resLog, resPositions] = await Promise.all([
        fetch('/api/applicants'),
        fetch('/api/interviews'),
        fetch('/api/employees'),
        fetch('/api/audit-logs'),
        fetch('/api/positions')
      ]);

      const dataApp = await resApp.json();
      const dataInt = await resInt.json();
      const dataEmp = await resEmp.json();
      const dataLog = await resLog.json();
      const dataPositions = await resPositions.json();

      setApplicants(dataApp);
      setInterviews(dataInt);
      setEmployees(dataEmp);
      setAuditLogs(dataLog);
      setPositions(dataPositions);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!currentUser) setIsLoginOpen(true);
  }, [currentUser]);

  const handleOpenForm = (lineId) => {
    if (lineId) setSelectedLineUserId(lineId);
    setIsFormOpen(true);
  };

  const handleOpenScheduleModal = (applicant) => {
    setTargetApplicant(applicant);
    setIsScheduleModalOpen(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!targetApplicant) return;

    setScheduling(true);
    try {
      const res = await fetch('/api/interviews/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantId: targetApplicant.id,
          interviewDate,
          timeSlot,
          format,
          locationOrLink,
          adminUser: currentUser ? currentUser.username : 'admin',
          adminName: currentUser ? currentUser.name : 'ผู้ดูแลระบบ'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ไม่สามารถนัดสัมภาษณ์ได้');

      alert(`ส่งข้อความนัดสัมภาษณ์ไปยัง LINE ของคุณ ${targetApplicant.name} เรียบร้อยแล้ว!\n(ระบบเริ่มนับถอยหลังยืนยัน 12 ชม.)`);
      setIsScheduleModalOpen(false);
      loadAllData();
      setActiveTab('interviews');
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setScheduling(false);
    }
  };

  const handleLogout = async () => {
    if (currentUser) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser.username, userName: currentUser.name })
      });
    }
    setCurrentUser(null);
    loadAllData();
  };

  return (
    <div className="app-shell">
      {/* Compact left sidebar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
      />

      <div className="app-content">
        {/* Main App Container */}
        <main style={{ maxWidth: 1280, width: '100%', margin: '24px auto', padding: '0 20px', flex: 1 }}>
        {/* Quick Analytics Banner Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div className="pastel-card" style={{ background: 'linear-gradient(135deg, #FFF0F5 0%, #FFFFFF 100%)', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#F8A5C2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#636E72' }}>ผู้สมัครงานทั้งหมด</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#2D3436' }}>{applicants.length} คน</div>
            </div>
          </div>

          <div className="pastel-card" style={{ background: 'linear-gradient(135deg, #F3E8FF 0%, #FFFFFF 100%)', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#B892FF', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#636E72' }}>รอยืนยันสัมภาษณ์ (12 ชม.)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#7A52C7' }}>
                {interviews.filter(i => i.confirmationStatus === 'Pending_Confirmation').length} รายการ
              </div>
            </div>
          </div>

          <div className="pastel-card" style={{ background: 'linear-gradient(135deg, #E8F5E9 0%, #FFFFFF 100%)', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#55E6C1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#636E72' }}>พนักงานในระบบ (Employee)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#2E7D32' }}>{employees.length} คน</div>
            </div>
          </div>

          <div className="pastel-card" style={{ background: 'linear-gradient(135deg, #EBF8FF 0%, #FFFFFF 100%)', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#70A1FF', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#636E72' }}>ประวัติ Audit Log</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#2980B9' }}>{auditLogs.length} บันทึก</div>
            </div>
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === 'applicants' && (
          <ApplicantList
            applicants={applicants}
            onRefresh={loadAllData}
            onScheduleInterview={handleOpenScheduleModal}
            onOpenEmployeeTab={() => setActiveTab('employees')}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'interviews' && (
          <InterviewScheduleView
            interviews={interviews}
            onRefresh={loadAllData}
            onScheduleNew={() => {
              if (applicants.length > 0) handleOpenScheduleModal(applicants[0]);
              else alert('ยังไม่มีรายการผู้สมัครในระบบ');
            }}
          />
        )}

        {activeTab === 'employees' && (
          <EmployeeManagement
            employees={employees}
            positions={positions}
            onRefresh={loadAllData}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'positions' && (
          <PositionManagement positions={positions} onRefresh={loadAllData} currentUser={currentUser} />
        )}

        {activeTab === 'audit-logs' && (
          <AuditLogView auditLogs={auditLogs} />
        )}

        {activeTab === 'line-sim' && (
          <LineSimulator
            lineUserId={selectedLineUserId}
            setLineUserId={setSelectedLineUserId}
            onOpenForm={handleOpenForm}
          />
        )}
        </main>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          loadAllData();
        }}
      />

      {/* Public Job Application Form Modal (Simulated LINE Link Form) */}
      {isFormOpen && (
        <JobApplicationForm
          lineUserId={selectedLineUserId}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            setIsFormOpen(false);
            loadAllData();
            setActiveTab('applicants');
          }}
        />
      )}

      {/* Schedule Interview Modal */}
      {isScheduleModalOpen && targetApplicant && (
        <div className="modal-overlay" onClick={() => setIsScheduleModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <h3 style={{ fontSize: '1.3rem', color: '#2D3436', fontWeight: 600, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={22} style={{ color: '#B892FF' }} />
              นัดหมายสัมภาษณ์งาน
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#636E72', marginBottom: 16 }}>
              ผู้สมัคร: <b>{targetApplicant.name}</b> ({targetApplicant.position})<br />
              LINE ID: {targetApplicant.lineUserId}
            </p>

            <form onSubmit={handleScheduleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label>วันที่สัมภาษณ์ *</label>
                  <input
                    type="date"
                    className="input-pastel"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>ช่วงเวลา *</label>
                  <input
                    type="text"
                    className="input-pastel"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    placeholder="14:00 - 15:00"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>รูปแบบการสัมภาษณ์</label>
                <select
                  className="input-pastel"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                >
                  <option value="Online (Google Meet)">Online (Google Meet)</option>
                  <option value="On-Site">On-Site (ที่สำนักงานใหญ่)</option>
                  <option value="Phone Call">โทรศัพท์ (Phone Interview)</option>
                </select>
              </div>

              <div className="form-group">
                <label>ลิงก์ห้องสัมภาษณ์ / สถานที่</label>
                <input
                  type="text"
                  className="input-pastel"
                  value={locationOrLink}
                  onChange={(e) => setLocationOrLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                />
              </div>

              <div style={{ background: '#FFF3E0', padding: 12, borderRadius: 12, fontSize: '0.8rem', color: '#E65100', marginBottom: 18 }}>
              <Clock size={17} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              <b>การทำงานอัตโนมัติ:</b> ระบบจะส่งข้อความแจ้งเตือนเข้า LINE ของผู้สมัครทันที และเริ่มนับถอยหลัง 12 ชั่วโมงเพื่อรอการกดยืนยันจากผู้สมัคร
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn-pastel btn-pastel-secondary" onClick={() => setIsScheduleModalOpen(false)} style={{ flex: 1 }}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn-pastel btn-pastel-primary" disabled={scheduling} style={{ flex: 1.5 }}>
                  <Sparkles size={16} />
                  {scheduling ? 'กำลังส่งข้อมูล...' : 'ส่งนัดหมายสัมภาษณ์เข้า LINE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ background: 'rgba(255, 255, 255, 0.7)', borderTop: '1px solid #EAEAEA', textAlign: 'center', padding: '16px 20px', fontSize: '0.82rem', color: '#636E72', marginTop: 40 }}>
        <HeartHandshake size={15} style={{ verticalAlign: 'middle', marginRight: 5 }} />
        LINE Recruitment & Employee Management System • Designed in Pastel Theme UX/UI
        </footer>
      </div>
    </div>
  );
}

function PublicApplicationPage({ lineUserId }) {
  return (
    <JobApplicationForm
      lineUserId={lineUserId}
      onClose={() => window.location.assign('/')}
      onSuccess={() => {}}
    />
  );
}

function getApplicationLinkParams() {
  const url = new URL(window.location.href);
  const normalizedPath = url.pathname.replace(/\/+$/, '').toLowerCase() || '/';
  const isApplyPath = normalizedPath === '/apply';
  const isLegacyApplyHash = url.hash.toLowerCase().startsWith('#apply');

  if (!isApplyPath && !isLegacyApplyHash) return null;

  const query = isLegacyApplyHash ? url.hash.slice('#apply'.length) : url.search;
  return new URLSearchParams(query);
}

// The URL is intentionally handled outside the admin dashboard.  This keeps the
// candidate's application link public and avoids opening the HR login/dashboard.
export default function App() {
  const applicationParams = getApplicationLinkParams();

  // This route gate deliberately runs before AdminApp is mounted.  Therefore an
  // application URL can never fall through to the dashboard, even without a LINE ID.
  if (applicationParams) {
    const params = applicationParams;
    return <PublicApplicationPage lineUserId={params.get('lineUserId') || ''} />;
  }

  return <AdminApp />;
}
