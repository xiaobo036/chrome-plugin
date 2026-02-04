// 补充：先定义获取激活标签页的工具函数（兜底用）
const getActiveTab = async (): Promise<chrome.tabs.Tab | null> => {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  return tabs.length > 0 ? tabs[0] : null;
};

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === "TOOLBAR_ITEM_CLICKED") {
    const { label } = message.payload;

    if (label === "矩形") {
      try {
        // 修复点1：校验并兜底获取 targetTab，避免 sender.tab 为空
        let targetTab: chrome.tabs.Tab | null | undefined = sender.tab;
        if (!targetTab) {
          targetTab = await getActiveTab(); // 主动获取激活的标签页
        }
        if (!targetTab) {
          sendResponse({
            status: "Error",
            message: "无法获取目标标签页，无法启动截图",
          });
          return true; // 保持通道开放（异步响应标识）
        }

        // 修复点2：仅在异步回调内调用 sendResponse，且返回 true 保持通道开放
        chrome.desktopCapture.chooseDesktopMedia(
          ["screen", "window"],
          targetTab, // 使用兜底后的有效 tab
          (streamId) => {
            if (streamId) {
              sendResponse({
                status: "Drawing rectangle started",
                streamId,
              });
            } else {
              sendResponse({
                status: "User canceled the screen selection",
              });
            }
          },
        );

        // 修复点3：返回 true 告知 Chrome 等待异步响应
        return true;
      } catch (error) {
        sendResponse({
          status: "Error",
          message: `启动矩形截图失败：${(error as Error).message}`,
        });
        return true;
      }
    } else if (label === "圆形") {
      sendResponse({ status: "Drawing circle started" });
    } else if (label === "撤销") {
      sendResponse({ status: "Last action undone" });
    } else if (label === "确认") {
      sendResponse({ status: "Action confirmed" });
    } else {
      // 补充：处理未知标签的情况
      sendResponse({ status: "Error", message: "未知的操作类型" });
    }
  }
});
