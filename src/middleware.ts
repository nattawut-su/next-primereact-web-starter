import { filterAuth } from '@/resources/lib/filters/authFilter';
import { filterCSP } from '@/resources/lib/filters/cspFilter';
import { NextRequest, NextResponse } from 'next/server';

/**
 * ทำงานก่อนที่ request จะไปถึง page หรือ API route เทียบเท่า web.xml ใน Java EE
 */
export function middleware(request: NextRequest) {
  // เริ่มจาก response ว่างๆ
  let response = NextResponse.next();

  // 1) ตรวจสอบการ login
  response = filterAuth(request, response);

  // 2) ใส่ CSP + Security Headers
  response = filterCSP(request, response);

  return response;
}

/**
 * การกำหนดว่า middleware จะทำงานกับ URL path ไหนบ้าง
 * เพื่อประสิทธิภาพและป้องกันการทำงานที่ไม่จำเป็น
 */
export const config = {
  matcher: [
    /**
     * รัน middleware กับทุก path ยกเว้น:
     * - api/* (API routes ไม่ต้องการ CSP สำหรับ JSON)
     * - _next/static/* (ไฟล์ static เช่น CSS, JS, images)
     * - _next/image/* (ไฟล์รูปภาพที่ถูก optimize แล้ว)
     * - favicon.ico (ไอคอนของเว็บไซต์)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      /**
       * ไม่รัน middleware ถ้ามี headers เหล่านี้:
       * - next-router-prefetch: requests ที่ Next.js ทำการ prefetch
       * - purpose: prefetch: requests ที่ browser ทำการ prefetch
       * เพื่อลดการทำงานที่ไม่จำเป็นและเพิ่มประสิทธิภาพ
       */
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
