import { Message, StorageData } from '@/types';

// 插件安装时初始化存储
chrome.runtime.onInstalled.addListener(() => {
  const defaultData: StorageData = {
    username: 'guest',
    theme: 'light',
  };
  chrome.storage.local.set(defaultData);
  console.log('插件初始化完成');
});

// 监听消息（明确 message 类型）
chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  if (message.type === 'GET_USER_INFO') {
    chrome.storage.local.get('username', (result: Partial<StorageData>) => {
      sendResponse({ username: result.username || 'unknown' });
    });
    return true; // 异步响应需返回 true
  }
});