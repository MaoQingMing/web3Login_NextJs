import { serialize } from 'cookie';
import { NextResponse } from 'next/server';
import { verifyMessage } from 'ethers';
import { getNonceForAddress, clearNonceForAddress } from '../../lib/nonceStore';

export async function POST(request) {
  try {
    const { address, signature } = await request.json();

    console.log('!!!!!!!!!!!!!!!!!',address, signature);
    // 验证必要参数
    if (!address || !signature) {
      return NextResponse.json({
        code: 203,
        msg: '请传入有效的address和signature'
      }, { status: 200 });
    }

    // 获取该地址对应的nonce
    const nonce = getNonceForAddress(address);
    console.log('1111111111111111111111', nonce);
    if (!nonce) {
      return NextResponse.json({
        code: 203,
        msg: 'nonce已过期或不存在，请重新获取nonce'
      }, { status: 200 });
    }

    // 验证签名
    // personal_sign 签名的消息格式是: \x19Ethereum Signed Message:\n${message.length}${message}
    let recoveredAddress;
    try {
      recoveredAddress = verifyMessage(nonce, signature);
    } catch (error) {
      return NextResponse.json({
        code: 203,
        msg: '签名验证失败：' + error.message
      }, { status: 200 });
    }

    console.log('222222222222222', recoveredAddress.toLowerCase(), address);

    // 验证地址是否匹配（不区分大小写）
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json({
        code: 203,
        msg: '签名地址与提供的地址不匹配'
      }, { status: 200 });
    }

    // 验证成功，生成认证token（这里使用address作为token，生产环境建议使用JWT）
    const authToken = `${address.toLowerCase()}_${Date.now()}`;

    // 设置cookie
    const cookie = serialize('my_app_auth_token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 一周
      path: '/',
    });

    // 清除已使用的nonce
    clearNonceForAddress(address);

    // 创建响应并设置 headers
    const response = NextResponse.json({
      code: 200,
      msg: '签名验证成功',
      data: {
        address: address.toLowerCase()
      }
    }, { status: 200 });

    // 设置 Cookie header
    response.headers.set('Set-Cookie', cookie);
    
    return response;
  } catch (error) {
    const errorResponse = NextResponse.json({
      code: 500,
      msg: error.message || 'Internal server error',
    }, { status: 500 });
    
    // 错误响应也可以添加 headers
    errorResponse.headers.set('X-Error', 'true');
    
    return errorResponse;
  }
}