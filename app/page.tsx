'use client'
import {useEffect, useState} from "react";
import {ethers} from "ethers";


export default function Home() {

    const [account, setAccount] = useState<string | undefined>('');
    async function Login() {
        if (!window.ethereum) {
            alert("请先安装 MetaMask 或其他以太坊钱包扩展。");
            return;
        }

        try {
            // 1️⃣ 请求用户授权钱包（返回地址）
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
            const address = accounts?.[0];
            console.log("✅ 钱包地址:", address);
            
            // 确保地址格式正确（小写）
            if (!address) {
                alert("无法获取钱包地址");
                return;
            }

            // 2️⃣ 从后端请求 nonce
            const res = await fetch('/api/getNonce', { method: 'POST', body: JSON.stringify({ address }) });
            const result = await res.json();
            let nonce
            if (result.code === 200) {
                nonce = result.data.nonce;
            } else {
                alert(result.msg);
            }


            console.log('!!!!!!!!!!!!!!!!!!!!!!!!!', address, 'nonce:', nonce);
            // 3️⃣ 让用户签名 nonce
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const signature = await signer.signMessage(nonce);

            console.log("✅ 用户签名:", signature);

            // 4️⃣ 把地址和签名发送给后端验证
            // 使用实际签名的地址（signingAddress）而不是原始地址
            const verifyRes = await fetch('/api/verifySignature', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, signature }),
            });

            const verifyResult = await verifyRes.json();
            if (verifyResult.code === 200) {
                console.log("🎉 登录成功！", verifyResult);
                setAccount(verifyResult.data.address);
            } else {
                alert("登录失败：" + verifyResult.msg);
            }
        } catch (err) {
            console.error(err);
            alert("登录失败：" + err);
        }
    }
    async function GetUserData() {
        const response = await fetch('/api/getAccountData',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        try {
            const res = await response.json();
            if(res.code === 200) {
                console.log(res.msg)
                setAccount(res.msg);
            } else {
                console.log(res.msg)
            }
        }
        catch (e) {
            alert(`Failed to login with id ${e}`);
        }
    }

    async function Logout() {
        try {
            const response = await fetch('/api/logOut', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const result = await response.json();
            if (result.code === 200) {
                setAccount(''); // 清空前端状态
                console.log("✅ 登出成功");
            } else {
                alert("登出失败：" + result.msg);
            }
        } catch (err) {
            console.error(err);
            alert("登出失败：" + err);
        }
    }

    function getCookie(name:string) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');

        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1, c.length);
            }
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length, c.length);
            }
        }
        return null;
    }
    useEffect(() => {
        console.log(getCookie('my_app_auth_token'))
        GetUserData()
    }, [])
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900 font-sans">
          {
              account ?
                  <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
                      <div className="text-center mb-6">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                          </div>
                          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">已登录</h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">钱包地址</p>
                          <div className="bg-gray-50 dark:bg-zinc-700 rounded-lg p-3 break-all">
                              <p className="text-sm font-mono text-gray-700 dark:text-gray-300">
                                  {account}
                              </p>
                          </div>
                      </div>
                      <button
                          onClick={() => Logout()}
                          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                      >
                          退出登录
                      </button>
                  </div> :
                  <div className="text-center">
                      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-12 max-w-md w-full mx-4">
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                          </div>
                          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Web3 登录</h1>
                          <p className="text-gray-600 dark:text-gray-400 mb-8">使用 MetaMask 钱包连接并登录</p>
                          <button
                              onClick={() => Login()}
                              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-3 relative overflow-hidden group"
                          >
                              <span className="relative z-10 flex items-center gap-3">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                  <span>连接钱包登录</span>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                              </span>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                          </button>
                      </div>
                  </div>
          }
      </div>
    );
}
