import { NextRequest, NextResponse } from 'next/server';

export function filterAuth(request: NextRequest, response: NextResponse) {
  const token = request.cookies.get('auth_token')?.value;
  const url = request.nextUrl.clone();

  // อนุญาตให้เข้า /login ได้
  if (url.pathname === '/login') {
    if (token) {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
    return response;
  }

  // บล็อกทุกหน้าอื่น ถ้าไม่มี token
  if (!token) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return response;
}
