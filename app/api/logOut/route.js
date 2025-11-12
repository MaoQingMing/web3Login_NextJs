import { serialize } from 'cookie';
import { NextResponse } from 'next/server';

export async function POST() {
  // 删除 cookie：设置 maxAge 为 0 或 expires 为过去的时间
  const cookie = serialize('my_app_auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: 0, // 设置为 0 表示立即过期
    path: '/',
  });

  const response = NextResponse.json({
    code: 200,
    msg: '登出成功',
  }, { status: 200 });

  // 设置 Cookie header 来删除 cookie
  response.headers.set('Set-Cookie', cookie);
  
  return response;
}