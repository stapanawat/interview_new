import React from 'react';
import {
  Users,
  Calendar,
  UserCheck,
  ShieldCheck,
  MessageSquare,
  LogIn,
  LogOut,
  HeartHandshake,
  Briefcase,
} from 'lucide-react';

const navigationItems = [
  { id: 'applicants', label: 'รายการผู้สมัครงาน', icon: Users },
  { id: 'interviews', label: 'ตารางนัดสัมภาษณ์', icon: Calendar },
  { id: 'employees', label: 'จัดการพนักงาน', icon: UserCheck },
  { id: 'positions', label: 'จัดการตำแหน่งงาน', icon: Briefcase },
  { id: 'audit-logs', label: 'ประวัติการใช้งาน', icon: ShieldCheck },
  { id: 'line-sim', label: 'จำลอง LINE Chat', icon: MessageSquare, accent: true },
];

export default function Navbar({ activeTab, setActiveTab, currentUser, onOpenLogin, onLogout }) {
  return (
    <aside className="sidebar" aria-label="เมนูหลัก">
      <button
        className="sidebar-brand sidebar-tooltip"
        aria-label="หน้าแรก"
        data-tooltip="LINE HR Recruitment System"
        onClick={() => setActiveTab('applicants')}
      >
        <HeartHandshake size={27} />
      </button>

      <nav className="sidebar-nav">
        {navigationItems.map(({ id, label, icon: Icon, accent }) => (
          <button
            key={id}
            type="button"
            className={`sidebar-item sidebar-tooltip ${activeTab === id ? 'is-active' : ''} ${accent ? 'is-line' : ''}`}
            aria-label={label}
            aria-current={activeTab === id ? 'page' : undefined}
            data-tooltip={label}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={21} />
            <span className="sidebar-label">{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-user">
        {currentUser ? (
          <>
            <img
              className="sidebar-avatar sidebar-tooltip"
              src={currentUser.avatar}
              alt={currentUser.name}
              data-tooltip={`${currentUser.name} (${currentUser.role})`}
            />
            <button
              type="button"
              className="sidebar-item sidebar-logout sidebar-tooltip"
              aria-label="ออกจากระบบ"
              data-tooltip="ออกจากระบบ"
              onClick={onLogout}
            >
              <LogOut size={20} />
              <span className="sidebar-label">ออกจากระบบ</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            className="sidebar-item sidebar-login sidebar-tooltip"
            aria-label="เข้าสู่ระบบ"
            data-tooltip="เข้าสู่ระบบ"
            onClick={onOpenLogin}
          >
            <LogIn size={21} />
            <span className="sidebar-label">เข้าสู่ระบบ</span>
          </button>
        )}
      </div>
    </aside>
  );
}
