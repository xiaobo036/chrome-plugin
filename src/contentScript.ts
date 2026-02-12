import { Message } from '@/types';

// 定义内容脚本可以处理的消息类型
type ContentScriptMessage = {
  type: 'START_SELECTION' | 'START_DRAWING' | 'START_EDITING' | 'STOP_EDITING' | 'COPY_CONTENT';
  tool?: string;
  options?: any;
};

// 通知 Background Script Content Script 已加载
console.log("Content Script 已加载");
chrome.runtime.sendMessage({
  type: "CONTENT_SCRIPT_LOADED"
});

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
chrome.runtime.onMessage.addListener((message: ContentScriptMessage, sender, sendResponse) => {
  console.log('Content Script 收到消息：', message, '来自：', sender);
  
  try {
    switch (message.type) {
      case 'START_SELECTION':
        console.log('开始选择模式，工具：', message.tool, '选项：', message.options);
        // 这里可以添加实际的选择模式逻辑
        sendResponse({ success: true, message: `已开始 ${message.tool} 选择模式` });
        break;
        
      case 'START_DRAWING':
        console.log('开始绘制模式，工具：', message.tool, '选项：', message.options);
        // 这里可以添加实际的绘制模式逻辑
        sendResponse({ success: true, message: `已开始 ${message.tool} 绘制模式` });
        break;
        
      case 'START_EDITING':
        console.log('开始编辑模式，工具：', message.tool, '选项：', message.options);
        // 这里可以添加实际的编辑模式逻辑
        sendResponse({ success: true, message: `已开始 ${message.tool} 编辑模式` });
        break;
        
      case 'STOP_EDITING':
        console.log('停止编辑模式');
        // 这里可以添加实际的停止编辑逻辑
        sendResponse({ success: true, message: '已停止编辑模式' });
        break;
        
      case 'COPY_CONTENT':
        console.log('复制选中内容');
        // 这里可以添加实际的复制内容逻辑
        sendResponse({ success: true, message: '内容已复制到剪贴板' });
        break;
        
      default:
        console.warn('未知的消息类型：', message.type);
        sendResponse({ success: false, error: '未知的消息类型' });
    }
  } catch (error) {
    console.error('处理消息时出错：', error);
    sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
  
  // 返回 true 以表示我们将异步发送响应
  return true;
});