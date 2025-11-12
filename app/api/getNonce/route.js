import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { setNonce, getNonceForAddress, clearNonceForAddress } from '../../lib/nonceStore';

export async function POST(request) {
  try {
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json({
        code: 203,
        msg: '请传入有效address'
      }, { status: 200 });
    }

    // 生成随机 nonce（32字节的十六进制字符串）
    const nonce = crypto.randomBytes(32).toString('hex');
    
    // 使用新的缓存模块存储 nonce
    setNonce(address, nonce);

    // 返回生成的 nonce
    return NextResponse.json({
      code: 200,
      data: {
        nonce,
        address: address.toLowerCase()
      }
    }, { status: 200 });
  } catch (error) {
    const errorResponse = NextResponse.json({
      code: 500,
      message: error.message || 'Internal server error',
    }, { status: 500 });
    errorResponse.headers.set('X-Error', 'true');
    return errorResponse;
  }
}

// 导出用于验证 nonce 的函数（供其他路由使用）
// 这些函数现在从 nonceStore 模块导出，保持向后兼容
export { getNonceForAddress, clearNonceForAddress };