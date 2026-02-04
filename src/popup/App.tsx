import { useState } from "react";
import "./App.css";

type ToolbarItem = {
  id: number;
  label: string;
  iconUrl: string;
};

const toolbarItems: ToolbarItem[] = [
  {
    id: 1,
    label: "矩形",
    iconUrl: "/icons/rectangle.png",
  },
  {
    id: 2,
    label: "圆形",
    iconUrl: "/icons/circle.png",
  },
  {
    id: 5,
    label: "撤销",
    iconUrl: "/icons/cancel.png",
  },
  {
    id: 6,
    label: "确认",
    iconUrl: "/icons/confirm.png",
  },
];

const App: React.FC = () => {
  // 新增：加载状态（针对需要异步处理的按钮，如矩形）
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleClickToolbarItem = async (item: ToolbarItem) => {
    const { label, id } = item;
    // 避免重复点击
    if (loadingId === id) return;

    try {
      // 步骤1：获取当前激活标签页（已有逻辑保留）
      const [activeTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!activeTab || !activeTab.id) {
        alert("无法获取当前标签页，请重试");
        return;
      }

      // 步骤2：针对「矩形」按钮添加加载态
      if (label === "矩形") {
        setLoadingId(id);
      }

      // 步骤3：发送消息并接收背景服务的响应（核心优化）
      const response = await new Promise<{
        status: string;
        streamId?: string;
        message?: string;
      }>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: "TOOLBAR_ITEM_CLICKED",
            payload: { label },
            tabId: activeTab.id, // 携带tabId给背景服务兜底
          },
          (response) => {
            // 捕获消息发送失败的错误
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          },
        );
      });

      // 步骤4：处理背景服务的响应（给用户反馈）
      if (response) {
        // 矩形截图的特殊处理（获取streamId）
        if (label === "矩形") {
          if (response.streamId) {
            console.log("矩形截图streamId：", response.streamId);
            // 这里可以触发前端的截图/绘制逻辑（比如传入streamId到画布）
            alert("矩形截图已启动，可开始框选区域");
          } else if (response.status.includes("canceled")) {
            alert("你取消了截图选择");
          } else if (response.status.includes("Error")) {
            alert(`截图失败：${response.message}`);
          }
        } else {
          // 其他按钮的反馈
          alert(`操作成功：${response.status}`);
        }
      }
    } catch (error) {
      // 步骤5：捕获所有异常，给用户友好提示
      const errorMsg = (error as Error).message;
      console.error("工具栏操作失败：", errorMsg);
      alert(`操作失败：${errorMsg}`);
    } finally {
      // 步骤6：结束加载态
      setLoadingId(null);
    }
  };

  // 新增：图标加载失败的兜底处理
  const handleIconError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src =
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMTAiIGZpbGw9IiM5OTk5OTkiLz4KPHBhdGggZD0iTTEwIDE0VjciIHN0cm9rZT0iIzY2NiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Ik0xMCAxN0g3IiBzdHJva2U9IiM2NjYiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNMTAgMTdIMTMiIHN0cm9rZT0iIzY2NiIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPg=="; // 默认占位图标
  };

  return (
    <div className="toolbar-wrapper">
      {toolbarItems.map((item) => {
        const isLoading = loadingId === item.id;
        return (
          <div
            className={`toolbar-item ${isLoading ? "toolbar-item-loading" : ""}`}
            key={item.id}
            title={item.label}
            onClick={() => handleClickToolbarItem(item)}
          >
            <img
              className="toolbar-item-icon"
              src={item.iconUrl}
              alt={item.label}
              onError={handleIconError} // 图标加载失败兜底
            />
            {/* 加载态提示（可选） */}
            {isLoading && <span className="loading-spinner"></span>}
          </div>
        );
      })}
    </div>
  );
};

export default App;
