import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, AlertTriangle, RefreshCw, XCircle, Send, Play, Bell, MapPin, MessageCircle, Mail } from 'lucide-react';
import { showConfirmAlert, showSuccessAlert, showErrorAlert } from '../utils/swal';

export default function InterviewScheduleView({ interviews, onRefresh, onScheduleNew }) {
  const [simulating, setSimulating] = useState(false);
  const [resendingId, setResendingId] = useState(null);

  const handleResend = async (interviewId) => {
    const interview = interviews.find((item) => item.id === interviewId);
    const approved = await showConfirmAlert(
      'ยืนยันการส่ง LINE ซ้ำ',
      `ต้องการส่งนัดสัมภาษณ์ซ้ำไปยัง ${interview?.applicantName || 'ผู้สมัคร'} หรือไม่? ระบบจะเริ่มนับ 12 ชั่วโมงใหม่เมื่อ LINE ตอบรับการส่งสำเร็จ`
    );
    if (!approved) return;

    setResendingId(interviewId);
    try {
      const res = await fetch(`/api/interviews/${interviewId}/resend`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to resend the LINE message');
      showSuccessAlert('ส่ง LINE สำเร็จ', data.message);
      onRefresh();
    } catch (err) {
      showErrorAlert('ส่ง LINE ไม่สำเร็จ', err.message);
    } finally {
      setResendingId(null);
    }
  };

  const handleSimulateTimeout = async (interviewId) => {
    const isConfirmed = await showConfirmAlert('ทดสอบระบบหมดเวลา', 'ต้องการทดสอบจำลองให้สิทธิ์ตอบรับ 12 ชั่วโมงหมดเวลาใช่หรือไม่? (ระบบจะยกเลิกนัดอัตโนมัติ)');
    if (!isConfirmed) {
      return;
    }
    setSimulating(true);
    try {
      const res = await fetch('/api/interviews/simulate-timeout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interviewId })
      });
      const data = await res.json();
      showSuccessAlert('ทดสอบระบบสำเร็จ', data.message);
      onRefresh();
    } catch (err) {
      showErrorAlert('เกิดข้อผิดพลาด', err.message);
    } finally {
      setSimulating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending_Confirmation':
        return <span className="badge badge-purple"><Clock size={14} /> รอยืนยันภายใน 12 ชม.</span>;
      case 'Confirmed':
        return <span className="badge badge-confirmed"><CheckCircle2 size={14} /> ยืนยันเข้าร่วมแล้ว</span>;
      case 'Postponed':
        return <span className="badge badge-rescheduled"><RefreshCw size={14} /> ขอเลื่อนวันสัมภาษณ์</span>;
      case 'Cancelled_Auto_12h':
        return <span className="badge badge-cancelled"><XCircle size={14} /> ยกเลิกอัตโนมัติ (เกิน 12 ชม.)</span>;
      case 'Cancelled_User':
        return <span className="badge badge-cancelled"><XCircle size={14} /> ผู้สมัครขอยกเลิก</span>;
      default:
        return <span className="badge badge-pending">{status}</span>;
    }
  };

  const interviewGroups = Object.values(interviews.reduce((groups, interview) => {
    const lineUserId = interview.lineUserId || `missing-${interview.id}`;
    if (!groups[lineUserId]) {
      groups[lineUserId] = { lineUserId: interview.lineUserId || '-', interviews: [] };
    }
    groups[lineUserId].interviews.push(interview);
    return groups;
  }, {}));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Banner */}
      <div className="pastel-card" style={{ background: 'linear-gradient(135deg, #FFF0F5 0%, #E3F2FD 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', color: '#2D3436', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={24} style={{ color: '#B892FF' }} />
            ตารางนัดสัมภาษณ์ & ระบบแจ้งเตือน 12 ชั่วโมง
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#636E72', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Bell size={16} /> ระบบจะส่งข้อความแจ้งเตือนทาง LINE ล่วงหน้า 1 วัน หากไม่มีการตอบรับยืนยันภายใน 12 ชม. ระบบจะยกเลิกสิทธิ์นัดสัมภาษณ์โดยอัตโนมัติ
          </p>
        </div>

        <button onClick={onScheduleNew} className="btn-pastel btn-pastel-primary">
          <Calendar size={18} />
          นัดสัมภาษณ์ผู้สมัครใหม่
        </button>
      </div>

      {/* Interviews are grouped by recipient, so a LINE account is easy to review. */}
      {interviewGroups.map((group) => (
        <section key={group.lineUserId} className="pastel-card" style={{ padding: 16, background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F5FF 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14, padding: '0 4px' }}>
            <div>
              <div style={{ fontWeight: 700, color: '#4C2A85', display: 'flex', alignItems: 'center', gap: 6 }}><MessageCircle size={17} /> LINE User ID: {group.lineUserId}</div>
              <div style={{ fontSize: '0.82rem', color: '#718096', marginTop: 3 }}>นัดหมาย {group.interviews.length} รายการสำหรับผู้รับรายเดียวกัน</div>
            </div>
            {group.interviews.length > 1 && <span className="badge badge-purple">จัดกลุ่มผู้รับเดียวกัน</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
        {group.interviews.map((interview) => {
          const isPending12h = interview.confirmationStatus === 'Pending_Confirmation';
          const deadlineText = interview.reminderDeadline ? new Date(interview.reminderDeadline).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : 'ไม่ระบุ';

          return (
            <div key={interview.id} className="pastel-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2D3436', margin: 0 }}>
                      {interview.applicantName}
                    </h3>
                    <span style={{ fontSize: '0.82rem', color: '#7A52C7', fontWeight: 500 }}>
                      ตำแหน่ง: {interview.position}
                    </span>
                  </div>
                  {getStatusBadge(interview.confirmationStatus)}
                </div>

                <div style={{ background: '#F8F9FA', borderRadius: 14, padding: 14, fontSize: '0.88rem', color: '#4A5568', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Calendar size={15} /><span><b>วันสัมภาษณ์:</b> {interview.interviewDate} ({interview.timeSlot})</span></div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><MapPin size={15} /><span><b>สถานที่ / รูปแบบ:</b> {interview.format} ({interview.locationOrLink})</span></div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><MessageCircle size={15} /><span><b>LINE User ID:</b> {interview.lineUserId}</span></div>
                  {interview.reminderSentAt && (
                    <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                      <Mail size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />ส่งแจ้งเตือน LINE เมื่อ: {new Date(interview.reminderSentAt).toLocaleString('th-TH')}
                    </div>
                  )}
                </div>

                {/* 12h Countdown Warning Box */}
                {isPending12h && (
                  <div className="timer-alert-box">
                    <Clock size={20} />
                    <div style={{ fontSize: '0.82rem' }}>
                      <b>หมดเขตกดยืนยันสัมภาษณ์:</b> {deadlineText} น.<br />
                      <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>หากไม่กดยืนยันใน LINE ภายใน 12 ชม. ระบบจะยกเลิกอัตโนมัติ</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Simulation Action Bar */}
              {isPending12h && (
                <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button
                    onClick={() => handleResend(interview.id)}
                    className="btn-pastel btn-pastel-primary"
                    disabled={resendingId === interview.id}
                    style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                  >
                    <Send size={14} /> {resendingId === interview.id ? 'กำลังส่ง...' : 'ส่ง LINE ซ้ำ'}
                  </button>
                  <button
                    onClick={() => handleSimulateTimeout(interview.id)}
                    className="btn-pastel btn-pastel-danger"
                    disabled={simulating}
                    style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                    title="ทดสอบจำลองให้สิทธิ์หมดเวลา 12 ชม. ทันที"
                  >
                    <Play size={14} /> ⚡ จำลองหมดเวลา 12 ชม. (Auto Cancel Test)
                  </button>
                </div>
              )}
            </div>
          );
        })}
          </div>
        </section>
      ))}
    </div>
  );
}
