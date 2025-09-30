import { buildCSPHeader, generateNonce } from '@/resources/lib/csp';
import { NextRequest, NextResponse } from 'next/server';

export function filterCSP(request: NextRequest, response: NextResponse) {
  // สร้าง nonce (number used once) ที่ไม่ซ้ำกันสำหรับแต่ละ request
  const nonce = generateNonce();

  // ตรวจสอบว่าอยู่ใน development mode หรือไม่
  const isDevelopment = process.env.NODE_ENV !== 'production';

  // สร้าง CSP header ตาม environment และ nonce ที่สร้างขึ้น
  const cspHeader = buildCSPHeader(nonce, isDevelopment);

  // เพื่อให้ components สามารถเข้าถึง nonce ได้
  response.headers.set('x-nonce', nonce);

  // เพิ่ม security headers ต่างๆ ใน response
  response.headers.set('Content-Security-Policy', cspHeader); // CSP policy หลัก
  response.headers.set('X-Frame-Options', 'SAMEORIGIN'); // ป้องกัน clickjacking
  response.headers.set('X-Content-Type-Options', 'nosniff'); // ป้องกัน MIME type sniffing
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin'); // ควบคุม referrer
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()'); // จำกัด permissions

  return response;
}
