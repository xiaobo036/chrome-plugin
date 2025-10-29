import { Message } from '@/types';

// 修改页面 DOM（带类型约束）
const body = document.body;
if (body) {
  body.style.fontFamily = 'Arial, sans-serif';
}

// 向 Background 发送消息
const message: Message = {
  type: 'SET_USER_INFO',
  payload: { username: 'ts-user' },
};
chrome.runtime.sendMessage(message);

// 监听来自 Popup/Background 的消息
chrome.runtime.onMessage.addListener((message: Message) => {
  if (message.type === 'GET_USER_INFO') {
    console.log('Content Script 收到消息：', message.payload);
  }
});