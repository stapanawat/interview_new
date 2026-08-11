import React, { useState, useEffect, useRef } from 'react';
import { Send, Clock, Check, RefreshCw, XCircle, FileText, Smartphone, Plus, User, MessageCircle } from 'lucide-react';

export default function LineSimulator({ lineUserId, setLineUserId, onOpenForm }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newLineId, setNewLineId] = useState('');

  const [candidateList, setCandidateList] = useState([
    { id: 'U883719204', name: 'กมลชนก (Candidate)' },
    { id: 'U1002948182', name: 'พิชญา (Candidate)' },
    { id: 'U992817263', name: 'ณัฐพงษ์ (Candidate)' }
  ]);

  const chatEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/line/messages?lineUserId=${encodeURIComponent(lineUserId)}`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('Error fetching LINE messages:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [lineUserId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend) => {
    const txt = textToSend || inputText;
    if (!txt.trim()) return;

    setLoading(true);
    try {
      await fetch('/api/line/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineUserId, text: txt })
      });
      setInputText('');
      fetchMessages();
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = (e) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    const generatedId = newLineId.trim() || `U${Math.floor(100000000 + Math.random() * 900000000)}`;
    const newCand = { id: generatedId, name: `${newUserName.trim()} (LINE User)` };
    
    setCandidateList(prev => [newCand, ...prev]);
    setLineUserId(generatedId);
    setIsAddingUser(false);
    setNewUserName('');
    setNewLineId('');
  };

  const handleRespondInterview = async (interviewId, action) => {
    let reason = '';
    if (action === 'POSTPONE') {
      reason = prompt('กรุณาระบุเหตุผลในการขอเลื่อนนัดสัมภาษณ์ (ถ้ามี):', 'ติดภารกิจ');
      if (reason === null) return;
    }

    try {
      await fetch('/api/interviews/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interviewId, action, lineUserId, reason })
      });
      fetchMessages();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการตอบรับสัมภาษณ์: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '20px auto' }}>
      <div className="pastel-card" style={{ padding: 0, overflow: 'hidden', border: '2px solid #06C755', borderRadius: 28, boxShadow: '0 20px 40px rgba(6, 199, 85, 0.15)' }}>
        {/* LINE Chat Header */}
        <div style={{ background: '#06C755', color: 'white', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06C755' }}>
              <Smartphone size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1rem' }}>LINE Official Recruitment Bot</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.9 }}>แชตกับผู้สมัครงาน • ID: @hr_recruit</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <select
              value={lineUserId}
              onChange={(e) => setLineUserId(e.target.value)}
              style={{ padding: '4px 8px', borderRadius: 12, border: 'none', background: 'rgba(255,255,255,0.25)', color: 'white', fontSize: '0.8rem', fontWeight: 500 }}
            >
              {candidateList.map(cand => (
                <option key={cand.id} value={cand.id} style={{ color: '#333' }}>
                  {cand.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsAddingUser(!isAddingUser)}
              style={{ padding: '4px 8px', borderRadius: 12, border: 'none', background: 'white', color: '#06C755', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
              title="เพิ่มผู้สมัคร LINE คนใหม่"
            >
              <Plus size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> เพิ่ม
            </button>
          </div>
        </div>

        {/* Dynamic Add User Modal Inside LINE Frame */}
        {isAddingUser && (
          <form onSubmit={handleAddCandidate} style={{ background: '#E8F5E9', padding: 12, borderBottom: '1px solid #A5D6A7', display: 'flex', gap: 6 }}>
            <input
              type="text"
              className="input-pastel"
              placeholder="ชื่อผู้สมัคร LINE คนใหม่"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '0.8rem' }}
              required
            />
            <button type="submit" className="btn-pastel btn-pastel-success" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              สร้าง
            </button>
          </form>
        )}

        {/* LINE Messages Area */}
        <div style={{ height: 440, overflowY: 'auto', background: '#8C9EFF', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'white', marginTop: 40, opacity: 0.9, fontSize: '0.85rem' }}>
              ยังไม่มีข้อความสนทนา พิมพ์ข้อความด้านล่างเพื่อเริ่มคุยกับ LINE Bot
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '82%',
                    padding: '12px 16px',
                    borderRadius: isUser ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                    background: isUser ? '#55E6C1' : 'white',
                    color: isUser ? '#1B4D3E' : '#2D3436',
                    fontSize: '0.9rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    whiteSpace: 'pre-line'
                  }}>
                    {msg.text}

                    {/* If message has action link for job form */}
                    {msg.actionLink && (
                      <div style={{ marginTop: 10 }}>
                        <button
                          onClick={() => onOpenForm(lineUserId)}
                          className="btn-pastel btn-pastel-primary"
                          style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem' }}
                        >
                          <FileText size={16} />
                          เปิดแบบฟอร์มสมัครงาน
                        </button>
                      </div>
                    )}

                    {/* If interview invite requiring candidate confirmation & 12h countdown */}
                    {msg.requiresConfirmation && msg.interviewId && (
                      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #EEEEEE' }}>
                        <div style={{ background: '#FFF3E0', color: '#E65100', padding: '6px 10px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                          <Clock size={14} />
                          กรุณายืนยันภายใน 12 ชั่วโมง (หากไม่ยืนยันจะยกเลิกอัตโนมัติ)
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <button
                            onClick={() => handleRespondInterview(msg.interviewId, 'CONFIRM')}
                            className="btn-pastel btn-pastel-success"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            <Check size={14} /> ✅ ยืนยันเข้าร่วมสัมภาษณ์
                          </button>
                          <button
                            onClick={() => handleRespondInterview(msg.interviewId, 'POSTPONE')}
                            className="btn-pastel btn-pastel-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            <RefreshCw size={14} /> ขอเลื่อนนัดสัมภาษณ์
                          </button>
                          <button
                            onClick={() => handleRespondInterview(msg.interviewId, 'CANCEL')}
                            className="btn-pastel btn-pastel-danger"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            <XCircle size={14} /> ❌ ขอยกเลิกนัดสัมภาษณ์
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.85)', marginTop: 2, padding: '0 4px' }}>
                    {new Date(msg.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* LINE Chat Quick Preset Actions */}
        <div style={{ background: '#F8F9FA', padding: '8px 12px', borderTop: '1px solid #EAEAEA', display: 'flex', gap: 6, overflowX: 'auto' }}>
          <button
            onClick={() => handleSend('สวัสดีครับ สนใจสมัครงานครับ')}
            style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: 16, background: '#E8F5E9', border: '1px solid #A5D6A7', color: '#1B5E20', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            <MessageCircle size={14} /> สนใจสมัครงาน
          </button>
          <button
            onClick={() => onOpenForm(lineUserId)}
            style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: 16, background: '#E3F2FD', border: '1px solid #90CAF9', color: '#0D47A1', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            <FileText size={14} /> กรอกใบสมัครงาน
          </button>
        </div>

        {/* LINE Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ padding: 12, background: 'white', display: 'flex', gap: 8 }}>
          <input
            type="text"
            className="input-pastel"
            placeholder="พิมพ์ข้อความคุยกับ LINE Bot..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          />
          <button type="submit" className="btn-pastel btn-pastel-primary" disabled={loading} style={{ padding: '8px 16px' }}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
