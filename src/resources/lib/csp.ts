import { headers } from 'next/headers';

/**
 * สร้าง nonce (number used once) แบบสุ่มสำหรับ CSP
 * nonce คือรหัสที่ใช้ครั้งเดียว ป้องกันการรัน inline scripts ที่ไม่ได้รับอนุญาต
 *
 * @returns string - nonce ในรูปแบบ base64 ที่มีความยาว 16 bytes
 */
export function generateNonce(): string {
  // ใช้ Web Crypto API แทน Node.js crypto เพื่อให้ทำงานได้ใน Edge Runtime
  // Edge Runtime ไม่รองรับ Node.js modules ธรรมดา
  const array = new Uint8Array(16); // สร้าง array ขนาด 16 bytes
  crypto.getRandomValues(array); // เติมค่าสุ่มใน array
  return btoa(String.fromCharCode(...array)); // แปลงเป็น base64 string
}

/**
 * ดึง nonce จาก headers ที่ถูกส่งมาจาก middleware
 * ใช้ใน React components เพื่อเพิ่ม nonce ใน inline scripts/styles
 *
 * @returns Promise<string> - nonce ที่ได้จาก x-nonce header หรือ empty string
 */
export async function getCSPNonce(): Promise<string> {
  const headersList = await headers(); // ดึง headers จาก Next.js (ต้อง await เพราะเป็น async)
  return headersList.get('x-nonce') ?? ''; // ดึงค่า x-nonce หรือคืน empty string ถ้าไม่มี
}

/**
 * สร้าง Content Security Policy (CSP) header สำหรับความปลอดภัย
 * CSP ช่วยป้องกัน XSS attacks โดยควบคุมว่า resources ไหนสามารถโหลดได้
 *
 * @param nonce - รหัส nonce ที่จะใช้อนุญาต inline scripts/styles
 * @param isDevelopment - true ถ้าอยู่ใน development mode (จะผ่อนปรนกฎบางข้อ)
 * @returns string - CSP policy ที่พร้อมใช้งาน
 */
export function buildCSPHeader(nonce: string, isDevelopment: boolean): string {
  const policies = [
    // กำหนดแหล่งเริ่มต้นที่อนุญาต - เฉพาะจาก origin เดียวกัน
    "default-src 'self'",

    // กำหนดว่า <base> tag สามารถชี้ไปที่ไหนได้ - เฉพาะ origin เดียวกัน
    "base-uri 'self'",

    // ห้ามโหลด plugins เช่น Flash, Java applets
    "object-src 'none'",

    // ควบคุมว่าหน้านี้สามารถแสดงใน iframe ได้จากไหน - เฉพาะ origin เดียวกัน
    "frame-ancestors 'self'",

    // อนุญาตให้โหลดรูปภาพจาก: origin เดียวกัน, data URLs, blob URLs
    "img-src 'self' data: blob:",

    // อนุญาตให้โหลด styles จาก origin เดียวกัน และอนุญาต inline styles ทั้งหมด
    "style-src 'self' 'unsafe-inline'",

    // อนุญาตให้โหลด fonts จาก origin เดียวกัน
    "font-src 'self'",

    // Script policy ที่แตกต่างกันระหว่าง development และ production
    isDevelopment
      ? `script-src 'self' 'nonce-${nonce}' 'unsafe-eval'` // dev: เพิ่ม unsafe-eval สำหรับ hot reload
      : `script-src 'self' 'nonce-${nonce}'`, // prod: เข้มงวดกว่า ไม่มี unsafe-eval

    // การเชื่อมต่อ network - dev อนุญาตทุกที่, prod เฉพาะ origin เดียวกัน
    isDevelopment ? 'connect-src *' : "connect-src 'self'",

    // Web Workers - dev อนุญาต blob, prod เฉพาะ origin เดียวกัน
    isDevelopment ? "worker-src 'self' blob:" : "worker-src 'self'",
  ];

  // รวม policies ทั้งหมดด้วย '; ' เป็น CSP header เดียว
  return policies.join('; ');
}
