// 补充：先定义获取激活标签页的工具函数（兜底用）
// const getActiveTab = async (): Promise<chrome.tabs.Tab | null> => {
//   const tabs = await chrome.tabs.query({
//     active: true,
//     currentWindow: true,
//   });
//   return tabs.length > 0 ? tabs[0] : null;
// };

type MessageType = {
  type:
    | "rectangle"
    | "circle"
    | "arrow"
    | "pen"
    | "mosaic"
    | "text"
    | "exit"
    | "copy";
};

// 向当前激活的标签页发送消息的函数
const sendMessageToActiveTab = (msg: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        console.error("没有找到激活的标签页");
        reject(new Error("No active tab found"));
        return;
      }
      
      const activeTab = tabs[0];
      console.log("找到激活的标签页:", activeTab.id, activeTab.url);
      
      if (!activeTab.id) {
        console.error("激活的标签页没有 ID");
        reject(new Error("Active tab has no ID"));
        return;
      }
      
      // 检查标签页 URL 是否是 chrome:// 协议
      if (activeTab.url?.startsWith("chrome://")) {
        console.error("不能在 chrome:// URL 上使用此功能");
        reject(new Error("Cannot use this feature on chrome:// URLs"));
        return;
      }
      
      // 尝试向标签页发送消息
      chrome.tabs.sendMessage(activeTab.id, msg, (response) => {
        if (chrome.runtime.lastError) {
          console.error("向标签页发送消息失败:", chrome.runtime.lastError);
          
          // 尝试重新注入 Content Script
          console.log("尝试重新注入 Content Script");
          chrome.scripting.executeScript({
            target: { tabId: activeTab.id! },
            files: ["contentScript.js"]
          }, () => {
            if (chrome.runtime.lastError) {
              console.error("重新注入 Content Script 失败:", chrome.runtime.lastError);
              reject(chrome.runtime.lastError);
            } else {
              console.log("重新注入 Content Script 成功，尝试再次发送消息");
              // 再次尝试发送消息
              setTimeout(() => {
                chrome.tabs.sendMessage(activeTab.id!, msg, (response) => {
                  if (chrome.runtime.lastError) {
                    console.error("再次发送消息失败:", chrome.runtime.lastError);
                    reject(chrome.runtime.lastError);
                  } else {
                    console.log("再次发送消息成功:", response);
                    resolve(response);
                  }
                });
              }, 100); // 等待 100ms 确保 Content Script 已加载
            }
          });
        } else {
          console.log("向标签页发送消息成功:", response);
          resolve(response);
        }
      });
    });
  });
};

// 处理工具消息的函数
const handleToolMessage = (type: MessageType['type'], sendResponse: (response: any) => void) => {
  let toolMessage: any;
  
  switch (type) {
    case "rectangle":
      console.log("开启框选功能");
      toolMessage = {
        type: "START_SELECTION",
        tool: "rectangle",
        options: {
          strokeColor: "#ff0000",
          strokeWidth: 2,
          fillColor: "rgba(255, 0, 0, 0.2)",
          isEnabled: true
        }
      };
      break;
    case "circle":
      console.log("开启椭圆框选功能");
      toolMessage = {
        type: "START_SELECTION",
        tool: "circle",
        options: {
          strokeColor: "#00ff00",
          strokeWidth: 2,
          fillColor: "rgba(0, 255, 0, 0.2)",
          isEnabled: true
        }
      };
      break;
    case "arrow":
      console.log("开启箭头绘制功能");
      toolMessage = {
        type: "START_DRAWING",
        tool: "arrow",
        options: {
          strokeColor: "#0000ff",
          strokeWidth: 3,
          isEnabled: true
        }
      };
      break;
    case "pen":
      console.log("开启画笔功能");
      toolMessage = {
        type: "START_DRAWING",
        tool: "pen",
        options: {
          strokeColor: "#000000",
          strokeWidth: 2,
          isEnabled: true
        }
      };
      break;
    case "mosaic":
      console.log("开启马赛克功能");
      toolMessage = {
        type: "START_EDITING",
        tool: "mosaic",
        options: {
          brushSize: 10,
          isEnabled: true
        }
      };
      break;
    case "text":
      console.log("开启文本功能");
      toolMessage = {
        type: "START_EDITING",
        tool: "text",
        options: {
          fontSize: 16,
          fontColor: "#000000",
          isEnabled: true
        }
      };
      break;
    case "exit":
      console.log("退出编辑模式");
      toolMessage = {
        type: "STOP_EDITING",
        options: {
          isEnabled: false
        }
      };
      break;
    case "copy":
      console.log("复制选中内容");
      toolMessage = {
        type: "COPY_CONTENT"
      };
      break;
    default:
      console.warn("未知的消息类型:", type);
      sendResponse({ success: false, error: "未知的消息类型" });
      return;
  }
  
  // 发送消息到激活的标签页
  sendMessageToActiveTab(toolMessage)
    .then(response => {
      console.log(`${type} 功能已开启:`, response);
      sendResponse({ success: true, message: `${type} 功能已开启` });
    })
    .catch(error => {
      console.error(`开启 ${type} 功能失败:`, error);
      sendResponse({ success: false, error: error.message });
    });
};

chrome.runtime.onMessage.addListener(
  (message: MessageType, sender, sendResponse) => {
    const { type } = message;
    
    // 处理工具消息
    handleToolMessage(type, sendResponse);
    
    // 返回true以表示我们将异步发送响应
    return true;
  },
);

// 监听 Content Script 加载完成的消息
chrome.runtime.onMessage.addListener(
  (message: any, sender, sendResponse) => {
    if (message.type === "CONTENT_SCRIPT_LOADED") {
      console.log("Content Script 已加载到标签页:", sender.tab?.id);
      sendResponse({ success: true });
    }
  },
);
