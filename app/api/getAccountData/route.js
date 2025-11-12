import { NextResponse } from 'next/server';
import {cookies} from "next/headers";

export async function POST() {
  try {

    // 验证cookie是否存在或失效
    const cookieStore = await cookies();
    const authToken = cookieStore.get('my_app_auth_token')?.value;
    if (authToken) {
      return NextResponse.json({
        code: 200,
        msg: authToken.split('_')[0],
      }, { status: 200 })
    } else {
      return NextResponse.json({
        code: 203,
        msg: 'you need to login',
      }, { status: 200 })
    }
  } catch (error) {
    const errorResponse = NextResponse.json({
      message: error.message || 'Internal server error',
    }, { status: 500 });

    // 错误响应也可以添加 headers
    errorResponse.headers.set('X-Error', 'true');

    return errorResponse;
  }
}