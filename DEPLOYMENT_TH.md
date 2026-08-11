# Deploy ฟรี: Vercel + Supabase

## 1. สร้างฐานข้อมูล Supabase

1. สร้างโปรเจกต์ใหม่ที่ [Supabase](https://supabase.com)
2. เปิด **SQL Editor** แล้วรันไฟล์ `supabase/schema.sql`
3. คัดลอก Project URL และ `service_role` key จาก Project Settings > API
4. ใส่ค่า `SUPABASE_URL` และ `SUPABASE_SERVICE_ROLE_KEY` ลงใน `.env` ภายในเครื่อง แล้วรัน `node scripts/migrate-to-supabase.js` หนึ่งครั้งเพื่อย้ายข้อมูลเดิม

ห้ามใส่ service-role key ในตัวแปรที่ขึ้นต้นด้วย `VITE_` หรือในโค้ดฝั่ง browser

## 2. Deploy ไป Vercel

1. Push repository ขึ้น GitHub แล้ว Import repository ใน [Vercel](https://vercel.com/new)
2. เพิ่ม Environment Variables สำหรับ Production และ Preview:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CRON_SECRET` (สุ่มข้อความยาวอย่างน้อย 32 ตัวอักษร)
   - `APP_BASE_URL` = URL ที่ Vercel ให้หลัง deploy เช่น `https://your-app.vercel.app`
   - `CORS_ORIGIN` = URL เดียวกัน
   - `NODE_ENV` = `production`
3. กด Deploy แล้วทดสอบ `<URL>/api/health`

Vercel จะใช้ `npm run build`, ให้ React จาก `dist` และใช้ `api/index.js` เป็น Express serverless API

## 3. ตั้ง reminder ทุก 15 นาที

Vercel Hobby ตั้ง cron ได้ไม่ถี่พอ จึงใช้บริการ scheduler ภายนอกที่เรียก URL นี้ทุก 15 นาที:

`https://your-app.vercel.app/api/internal/reminders?secret=<CRON_SECRET>`

ตั้ง URL นี้ใน cron-job.org หรือบริการ scheduler ที่เลือกใช้ และเก็บ secret เป็นความลับ เพราะ endpoint นี้สั่งให้ระบบตรวจ/ยกเลิกนัดหมายได้

## ก่อนเปิดใช้จริง

- ระบบ LINE ในโค้ดยังเป็น simulator ต้องเพิ่ม LINE Messaging API webhook และการส่ง push message ก่อนใช้งานกับผู้สมัครจริง
- รหัสผ่านผู้ใช้ในข้อมูลเดิมยังไม่ได้ hash; ควรย้ายไป Supabase Auth หรือ hash ด้วย bcrypt ก่อนใช้งานจริง
- ข้อมูลทั้งหมดอยู่ใน JSONB แถวเดียวเพื่อย้ายระบบเดิมโดยไม่กระทบหน้าเว็บ; สำหรับข้อมูลจริงจำนวนมากควรแยกเป็นตารางตาม entity
