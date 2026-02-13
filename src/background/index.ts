// 定义工具选项类型
type RectangleOptions = {
  strokeColor: string;
  strokeWidth: number;
  fillColor: string;
  isEnabled: boolean;
};

type CircleOptions = {
  strokeColor: string;
  strokeWidth: number;
  fillColor: string;
  isEnabled: boolean;
};

type ArrowOptions = {
  strokeColor: string;
  strokeWidth: number;
  isEnabled: boolean;
};

type PenOptions = {
  strokeColor: string;
  strokeWidth: number;
  isEnabled: boolean;
};

type MosaicOptions = {
  brushSize: number;
  isEnabled: boolean;
};

type TextOptions = {
  fontSize: number;
  fontColor: string;
  isEnabled: boolean;
};

type StopOptions = {
  isEnabled: boolean;
};

// 定义内容脚本消息类型
type ContentScriptMessage = {
  type:
    | "START_SELECTION"
    | "START_DRAWING"
    | "START_EDITING"
    | "STOP_EDITING"
    | "COPY_CONTENT";
  tool?: string;
  options?:
    | RectangleOptions
    | CircleOptions
    | ArrowOptions
    | PenOptions
    | MosaicOptions
    | TextOptions
    | StopOptions;
};

// 定义工具消息类型
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

// 定义响应类型
type ToolResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

/**
 * 向当前激活的标签页发送消息的函数
 * @param msg 要发送的消息
 * @returns 一个 Promise，解析为标签页的响应
 */
const sendMessageToActiveTab = (
  msg: ContentScriptMessage,
): Promise<ToolResponse> => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      checkActiveTab(tabs).then((activeTab) => {
        chrome.tabs.sendMessage(
          activeTab.id as number,
          msg,
          (response: ToolResponse | undefined) => {
            if (chrome.runtime.lastError) {
              console.error(
                "向标签页发送消息失败:",
                chrome.runtime.lastError.message,
              );
              reject(
                new Error(
                  `向标签页发送消息失败: ${chrome.runtime.lastError.message}`,
                ),
              );
              return;
            }
            if (response) {
              console.log("向标签页发送消息成功:", response);
              resolve(response);
            } else {
              console.error("标签页未响应");
              reject(new Error("标签页未响应"));
            }
          },
        );
      });
    });
  });
};

/**
 * 检查当前激活的标签页是否有效
 * @param tabs 浏览器返回的标签页数组
 * @returns 一个 Promise，解析为有效标签页
 */
const checkActiveTab = (tabs: chrome.tabs.Tab[]): Promise<chrome.tabs.Tab> => {
  return new Promise((resolve, reject) => {
    if (tabs && tabs.length === 0) {
      console.error("浏览器当前没有激活的标签页");
      reject(new Error("浏览器当前没有激活的标签页"));
      return;
    }

    const [activeTab] = tabs;

    const { id: tabId, url: tabUrl } = activeTab;

    if (!tabId) {
      console.error("激活的标签页没有 ID");
      reject(new Error("激活的标签页没有 ID"));
      return;
    }

    if (tabUrl?.startsWith("chrome://")) {
      console.error("不能在 chrome:// URL 上使用此功能");
      reject(
        new Error("不能在 Chrome 扩展页面上使用此功能，请在普通网页上尝试"),
      );
      return;
    }

    resolve(activeTab);
  });
};

/**
 * 
 * @param type 工具类型
 * @param sendResponse 用于发送响应的回调函数
 * @returns 
 */
const handleToolMessage = (
  type: MessageType["type"],
  sendResponse: (response: ToolResponse) => void,
) => {
  let toolMessage: ContentScriptMessage;

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
          isEnabled: true,
        },
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
          isEnabled: true,
        },
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
          isEnabled: true,
        },
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
          isEnabled: true,
        },
      };
      break;
    case "mosaic":
      console.log("开启马赛克功能");
      toolMessage = {
        type: "START_EDITING",
        tool: "mosaic",
        options: {
          brushSize: 10,
          isEnabled: true,
        },
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
          isEnabled: true,
        },
      };
      break;
    case "exit":
      console.log("退出编辑模式");
      toolMessage = {
        type: "STOP_EDITING",
        options: {
          isEnabled: false,
        },
      };
      break;
    case "copy":
      console.log("复制选中内容");
      toolMessage = {
        type: "COPY_CONTENT",
      };
      break;
    default:
      console.warn("未知的消息类型:", type);
      sendResponse({ success: false, error: "未知的消息类型" });
      return;
  }

  // 发送消息到激活的标签页
  sendMessageToActiveTab(toolMessage)
    .then((response) => {
      console.log(`${type} 功能已开启:`, response);
      sendResponse({ success: true, message: `${type} 功能已开启` });
    })
    .catch((error) => {
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

// 定义 Content Script 加载完成消息类型
type ContentScriptLoadedMessage = {
  type: "CONTENT_SCRIPT_LOADED";
};

// 监听 Content Script 加载完成的消息
chrome.runtime.onMessage.addListener(
  (message: ContentScriptLoadedMessage | MessageType, sender, sendResponse) => {
    if (message.type === "CONTENT_SCRIPT_LOADED") {
      console.log("Content Script 已加载到标签页:", sender.tab?.id);
      sendResponse({ success: true });
    }
  },
);
