# THE SEED v3 Clean

เวอร์ชันแก้ไขตาม feedback:
- ไม่มี mock data เริ่มต้น
- เปิดครั้งแรกเข้าหน้าเลือกตัวการ์ตูนก่อน
- ใช้ storage key ใหม่ `the-seed-v3-clean` เพื่อไม่ดึงข้อมูล demo เก่าจาก deploy เดิม
- ใช้ asset แบบ CSS/SVG-style โปร่งใส ไม่มีภาพตัดติดพื้นขาวโปะบนสวน
- Home ว่างจนกว่าผู้ใช้จะปลูกความฝันเอง
- รองรับ Plant Wizard, Custom frequency, Drag pot, Task checklist, Watering animation, Gallery, Export/Import JSON

## Deploy Netlify
1. แตกไฟล์ zip
2. Push ขึ้น GitHub
3. Netlify: New site from Git
4. Build command: `npm run build`
5. Publish directory: `dist`

## Local dev
```bash
npm install
npm run dev
```
