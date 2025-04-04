# MMLLO Project Summary

## Overview

MMLLO เป็น Trello Clone ที่พัฒนาด้วย Node.js และ SQLite เพื่อใช้ในการจัดการงานและโปรเจคต่างๆ ในรูปแบบ Kanban Board ซึ่งประกอบด้วย Board, List และ Card

## โครงสร้างโปรเจค

โปรเจคมีโครงสร้างดังนี้:

```
mmllo/
├── src/
│   ├── config/          # ไฟล์การตั้งค่า
│   ├── controllers/     # ตัวควบคุมการทำงานของ API
│   ├── database/        # ฐานข้อมูล SQLite
│   ├── middleware/      # Middleware สำหรับ Express
│   ├── models/          # โมเดลข้อมูล
│   ├── public/          # ไฟล์ static (CSS, JS, รูปภาพ)
│   ├── routes/          # เส้นทาง API
│   └── index.js         # จุดเริ่มต้นแอปพลิเคชัน
├── .env                 # ตัวแปรสภาพแวดล้อม
├── .gitignore           # ไฟล์ที่ไม่ต้องการติดตามใน Git
├── package.json         # การตั้งค่าแพ็คเกจ npm
└── README.md            # เอกสารโปรเจค
```

## คุณสมบัติหลัก

MMLLO มีคุณสมบัติหลักดังนี้:

1. **ระบบผู้ใช้**
   - สมัครสมาชิก ล็อกอิน ล็อกเอาท์
   - การจัดการบัญชีผู้ใช้

2. **การจัดการบอร์ด**
   - สร้าง แก้ไข ลบบอร์ด
   - ปรับแต่งสีพื้นหลังบอร์ด
   - ทำบอร์ดให้เป็นดาว (Star)
   - แชร์บอร์ดกับผู้ใช้อื่น

3. **การจัดการลิสต์**
   - สร้าง แก้ไข ลบลิสต์
   - จัดเรียงลิสต์ด้วย Drag and Drop

4. **การจัดการการ์ด**
   - สร้าง แก้ไข ลบการ์ด
   - เพิ่มคำอธิบาย วันที่กำหนด และป้ายกำกับ (Labels)
   - แสดงความคิดเห็นบนการ์ด
   - ย้ายการ์ดระหว่างลิสต์ด้วย Drag and Drop

## เทคโนโลยีที่ใช้

- **Backend**: Node.js, Express.js
- **ฐานข้อมูล**: SQLite
- **การรับรองความถูกต้อง**: JWT (JSON Web Tokens)
- **Frontend**: HTML, CSS, JavaScript

## API Endpoints

MMLLO มี API Endpoints หลักดังนี้:

### Authentication

- `POST /api/auth/register` - สมัครสมาชิกใหม่
- `POST /api/auth/login` - ล็อกอินผู้ใช้
- `POST /api/auth/logout` - ล็อกเอาท์ผู้ใช้
- `GET /api/auth/me` - ดูข้อมูลผู้ใช้ปัจจุบัน

### Boards

- `GET /api/boards` - ดูบอร์ดทั้งหมดของผู้ใช้ปัจจุบัน
- `POST /api/boards` - สร้างบอร์ดใหม่
- `GET /api/boards/:id` - ดูบอร์ดที่ระบุพร้อมลิสต์และการ์ด
- `PUT /api/boards/:id` - อัปเดตบอร์ด
- `DELETE /api/boards/:id` - ลบบอร์ด
- `PATCH /api/boards/:id/star` - ทำหรือยกเลิกการทำบอร์ดให้เป็นดาว

### Lists

- `GET /api/lists/board/:boardId` - ดูลิสต์ทั้งหมดของบอร์ด
- `POST /api/lists/board/:boardId` - สร้างลิสต์ใหม่
- `PUT /api/lists/:id` - อัปเดตลิสต์
- `DELETE /api/lists/:id` - ลบลิสต์
- `PATCH /api/lists/:id/move` - ย้ายลิสต์ไปยังตำแหน่งใหม่

### Cards

- `GET /api/cards/:id` - ดูการ์ดที่ระบุพร้อมความคิดเห็น
- `POST /api/cards/list/:listId` - สร้างการ์ดใหม่
- `PUT /api/cards/:id` - อัปเดตการ์ด
- `DELETE /api/cards/:id` - ลบการ์ด
- `PATCH /api/cards/:id/move` - ย้ายการ์ดไปยังตำแหน่งใหม่ในลิสต์เดียวกัน
- `PATCH /api/cards/:id/move-to-list` - ย้ายการ์ดไปยังลิสต์อื่น
- `POST /api/cards/:id/comments` - เพิ่มความคิดเห็นในการ์ด

## การติดตั้งและใช้งาน

1. โคลนโปรเจคจาก GitHub:
   ```
   git clone https://github.com/yourusername/mmllo.git
   cd mmllo
   ```

2. ติดตั้ง dependencies:
   ```
   npm install
   ```

3. สร้างไฟล์ `.env` ในโฟลเดอร์หลักและกำหนดค่าต่อไปนี้:
   ```
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key
   DB_PATH=./src/database/mmllo.sqlite
   ```

4. เริ่มการพัฒนา:
   ```
   npm run dev
   ```

5. เปิดเว็บเบราว์เซอร์และไปที่ `http://localhost:3000`

## การดำเนินการต่อไป

สำหรับการพัฒนาต่อไป อาจพิจารณาเพิ่มคุณสมบัติต่อไปนี้:

1. **Frontend Framework**: อัปเกรดเป็น React, Vue หรือ Angular
2. **รองรับโหมด Dark Mode**
3. **ระบบ Notifications**
4. **ฟีเจอร์ Attachments**
5. **รองรับการทำงานแบบ Offline**
6. **ระบบจัดการสมาชิกและทีมที่ซับซ้อนขึ้น**
7. **การเชื่อมต่อกับบริการภายนอก เช่น Google Drive, Dropbox**
8. **การเพิ่มแผนภูมิและการรายงาน**

## สรุป

MMLLO เป็นแอปพลิเคชัน Trello Clone ที่มีคุณสมบัติพื้นฐานที่จำเป็นสำหรับการจัดการงานในรูปแบบ Kanban Board โดยใช้เทคโนโลยี Node.js และ SQLite ซึ่งสามารถพัฒนาต่อยอดเพิ่มเติมเพื่อให้มีคุณสมบัติที่หลากหลายมากขึ้นได้ในอนาคต
