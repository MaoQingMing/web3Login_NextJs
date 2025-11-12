// 使用全局对象来存储 nonceStore，确保跨请求共享
// 在 Next.js 的 API 路由中，使用 global 对象可以确保在同一个服务器实例中共享数据
if (typeof global.nonceStore === 'undefined') {
  global.nonceStore = new Map();
}

// 获取 nonceStore 实例
function getNonceStore() {
  return global.nonceStore;
}

/**
 * 设置 nonce 到存储
 * @param {string} address - 钱包地址
 * @param {string} nonce - nonce 值
 */
export function setNonce(address, nonce) {
  const key = address.toLowerCase();
  const data = {
    nonce,
    timestamp: Date.now()
  };
  
  const store = getNonceStore();
  store.set(key, data);
  
  console.log('Nonce stored for address:', key, 'Store size:', store.size);
}

/**
 * 从存储获取 nonce
 * @param {string} address - 钱包地址
 * @returns {string|null} - nonce 值，如果不存在或已过期则返回 null
 */
export function getNonce(address) {
  const key = address.toLowerCase();
  const store = getNonceStore();
  const stored = store.get(key);
  
  console.log('Getting nonce for address:', key, 'Store size:', store.size, 'Found:', !!stored);
  
  // 检查是否过期（5分钟有效期）
  if (stored && Date.now() - stored.timestamp < 5 * 60 * 1000) {
    return stored.nonce;
  }
  
  // 如果过期，清除它
  if (stored) {
    clearNonce(address);
  }
  
  return null;
}

/**
 * 清除指定地址的 nonce
 * @param {string} address - 钱包地址
 */
export function clearNonce(address) {
  const key = address.toLowerCase();
  const store = getNonceStore();
  store.delete(key);
}

// 导出向后兼容的函数
export function getNonceForAddress(address) {
  return getNonce(address);
}

export function clearNonceForAddress(address) {
  clearNonce(address);
}

