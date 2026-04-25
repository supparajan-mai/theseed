# THE SEED - Living Action Plan App

แอปปลูกเป้าหมายให้เป็นต้นไม้ที่มีชีวิต สร้างด้วย React + Vite + Framer Motion ใช้ LocalStorage เท่านั้น พร้อม Export/Import JSON

## Run local
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Deploy Netlify
1. Push repo ขึ้น GitHub
2. Netlify > Add new site > Import from Git
3. Build command: `npm run build`
4. Publish directory: `dist`

## Features
- เลือกตัวแทนผู้ใช้ 6 แบบ
- เพาะเมล็ดพันธุ์ความฝัน
- เพิ่มภารกิจย่อยพร้อมความถี่ Daily / Weekly / Monthly / Quarterly / Custom
- แสดง Potential Growth
- สวนพร้อมกระถางหลายใบ
- กดค้างแล้วลากกระถางเพื่อย้ายตำแหน่ง
- แตะกระถางเพื่อเปิดภารกิจ
- ติ๊กภารกิจแล้วมีแอนิเมชั่นตัวการ์ตูนรดน้ำต้นไม้
- Export / Import ข้อมูล JSON
- Favicon 192x192 และ 512x512
