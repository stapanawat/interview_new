# Comprehensive Implementation & Review Plan: LINE Recruitment & Employee Management System

## Project Overview
Goal: Build a complete, production-grade **LINE Recruitment & Employee Management Web Application** following the requirements specified in `goal.md`.

### Core Requirements Matrix (`goal.md`)
1. **LINE Job Application Flow**: Candidate adds LINE bot -> Bot sends job application form link -> Candidate fills form -> Application sent to Web Admin.
2. **Interview Scheduling & Confirmation**: Admin schedules interview -> Invites sent back to LINE -> Candidate confirms/postpones/cancels.
3. **12-Hour Confirmation Reminder Logic**: 1 day before interview date, a notification is triggered. Candidate has 12 hours to respond; otherwise, system auto-cancels.
4. **Candidate Status & Employee Onboarding**: Status changes on web (e.g. "Passed") -> Automatically saves to Employee Management System (หน้าจัดการพนักงาน).
5. **Employee Management Fields**: Name, Email, Phone, Monthly Salary (รายเดือน), Additional Notes (รายละเอียดเพิ่มเติม).
6. **Pastel UX/UI Theme**: Easy to read, pastel colors, soothing tone, glassmorphism, responsive, immediate clarity on first visit.
7. **Login Audit Log**: Login tracks user history (who logged in, timestamp, actions taken).
8. **Loop Engineering Process**: Work divided into distinct phases with subagent team review & iterative quality assurance before moving to next phase.

---

## Architecture & Tech Stack
- **Backend Framework**: Node.js + Express
- **Frontend Framework**: React + Vite + Custom Pastel CSS Design System
- **Database & Storage**: Embedded SQLite / JSON File DB with ORM/data access layer
- **Real-time & Timers**: Node-Cron / Timer engine for 12-hour confirmation & reminder checks
- **LINE Integration**: LINE Messaging API simulator + Webhook handler

---

## Multi-Agent Team Roles & Workflow
1. **Lead Orchestrator (Main Agent)**: Coordinates phases, maintains architecture, and tracks progress.
2. **Backend & Logic Engineer Subagent**: Builds Express server, REST endpoints, database schemas, audit logging, and timer engines.
3. **Frontend UX/UI Specialist Subagent**: Crafts pastel CSS theme, interactive LINE chat widget, candidate form, dashboard, and employee management UI.
4. **QA & Code Reviewer Subagent**: Audits completed work against `goal.md` criteria, checks for errors, and enforces review loops.

---

## Phase Breakdown

### Phase 1: Foundation Setup & Project Scaffold
- Initialize React (Vite) + Express monorepo/unified architecture.
- Build Database schema (Applicants, Interviews, Employees, AuditLogs, Users).
- Setup Pastel CSS Design Tokens (Variables for colors, typography, shadows, pastel badges).

### Phase 2: Audit Logging & Authentication System
- Admin Auth & Login Screen.
- Audit Log Middleware (Tracks user login history, IP, user-agent, actions).
- Audit Log View UI in Dashboard.

### Phase 3: LINE Simulator & Candidate Application Form
- Interactive LINE Simulator Component (Simulates candidate adding bot and receiving application link).
- Web-based Job Application Form (Public URL with candidate details, skills, target position).
- Submission workflow to Admin Dashboard with instant updates.

### Phase 4: Recruitment Dashboard & Interview Scheduling
- Candidate Management List with status filters.
- Interview Scheduling Modal (Date, Time, Interviewer, Location/Link).
- LINE Invitation Push Simulation.
- Candidate LINE Confirmation UI (Confirm / Postpone / Cancel).
- 12-Hour Confirmation Timeout Engine (Auto-cancel if candidate does not confirm within 12h after reminder).

### Phase 5: Candidate Transition to Employee Management (หน้าจัดการพนักงาน)
- Status update workflow (Pending -> Interview Scheduled -> Confirmed -> Passed -> Moved to Employee).
- Employee Management Page UI:
  - Table & Grid view of all active employees.
  - Fields: Full Name, Email, Phone Number, Monthly Salary (รายเดือน), Additional Notes (รายละเอียดเพิ่มเติม).
  - Add / Edit / Delete / View details modal.
  - Export & Filter functions.

### Phase 6: Team Review, Bug Fixing & Final Polish
- QA Subagent full regression test against all 6 criteria in `goal.md`.
- Code review loop & fix resolution.
- UI aesthetic verification (Pastel theme, micro-animations, glassmorphism).
