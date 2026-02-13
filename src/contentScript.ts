import { Message, ContentScriptMessage, ToolBarOption } from "@/types";

// 全局变量
let isDrawing = false;
let selectedTool = "";
let startX = 0;
let startY = 0;
let currentElement: HTMLElement | SVGElement | null = null;
let cuttingArea: HTMLElement | null = null;
let currentOptions: ToolBarOption | null = null;

/**
 * 创建剪裁区域
 * @returns
 */
const createCuttingArea = (): HTMLElement => {
  if (!cuttingArea) {
    const newCuttingArea = document.createElement("div");
    newCuttingArea.id = "cutting-area";
    newCuttingArea.style.position = "absolute";
    newCuttingArea.style.border = "2px dashed #ff0000";
    newCuttingArea.style.pointerEvents = "none";
    newCuttingArea.style.zIndex = "9999";
    newCuttingArea.style.backgroundColor = "rgba(255, 0, 0, 0.2)";
    return newCuttingArea;
  }
  return cuttingArea;
};

// 开始绘制
const startDrawing = (e: MouseEvent) => {
  if (!selectedTool) return;

  cuttingArea = createCuttingArea();
  cuttingArea.style.pointerEvents = "auto";
  document.body.appendChild(cuttingArea);
  isDrawing = true;

  startX = e.clientX;
  startY = e.clientY;

  const strokeColor = currentOptions?.strokeColor || "#1296db";
  const strokeWidth = currentOptions?.strokeWidth || 2;

  if (selectedTool === "rectangle" || selectedTool === "circle") {
    currentElement = document.createElement("div");
    currentElement.style.position = "absolute";
    currentElement.style.border = `${strokeWidth}px solid ${strokeColor}`;
    currentElement.style.backgroundColor = currentOptions?.fillColor || "none";
    currentElement.style.left = `${startX}px`;
    currentElement.style.top = `${startY}px`;
    currentElement.style.width = "0";
    currentElement.style.height = "0";
    cuttingArea.appendChild(currentElement);
  } else if (selectedTool === "arrow") {
    // 创建箭头元素
    currentElement = document.createElement("div");
    currentElement.style.position = "absolute";
    currentElement.style.pointerEvents = "none";
    cuttingArea.appendChild(currentElement);
  } else if (selectedTool === "pen") {
    // 创建画笔路径
    currentElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    currentElement.style.position = "absolute";
    currentElement.style.width = "100%";
    currentElement.style.height = "100%";
    currentElement.style.top = "0";
    currentElement.style.left = "0";
    currentElement.style.pointerEvents = "none";

    // 创建路径元素
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.style.fill = "none";
    path.style.stroke = strokeColor;
    path.style.strokeWidth = strokeWidth.toString();
    path.setAttribute("d", `M ${startX} ${startY}`);

    currentElement.appendChild(path);
    cuttingArea.appendChild(currentElement);
  }
};

// 绘制中
const draw = (e: MouseEvent) => {
  if (!isDrawing || !currentElement) return;

  const endX = e.clientX;
  const endY = e.clientY;

  // 计算宽高和位置
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);
  const left = Math.min(startX, endX);
  const top = Math.min(startY, endY);

  // 更新元素样式
  if (selectedTool === "rectangle") {
    currentElement.style.width = `${width}px`;
    currentElement.style.height = `${height}px`;
    currentElement.style.left = `${left}px`;
    currentElement.style.top = `${top}px`;
  } else if (selectedTool === "circle") {
    const radius = Math.sqrt(width * width + height * height) / 2;
    currentElement.style.width = `${radius * 2}px`;
    currentElement.style.height = `${radius * 2}px`;
    currentElement.style.borderRadius = "50%";
    currentElement.style.left = `${left + width / 2 - radius}px`;
    currentElement.style.top = `${top + height / 2 - radius}px`;
  } else if (selectedTool === "arrow") {
    // 获取当前工具的样式选项
    const strokeColor = currentOptions?.strokeColor || "#1296db";
    const strokeWidth = currentOptions?.strokeWidth || 2;

    // 计算箭头角度
    const angle = Math.atan2(endY - startY, endX - startX);

    // 计算箭头长度
    const length = Math.sqrt(width * width + height * height);

    // 清除之前的内容
    currentElement.innerHTML = "";

    // 创建箭头线
    const line = document.createElement("div");
    line.style.position = "absolute";
    line.style.width = `${length}px`;
    line.style.height = `${strokeWidth}px`;
    line.style.backgroundColor = strokeColor;
    line.style.left = `${startX}px`;
    line.style.top = `${startY}px`;
    line.style.transformOrigin = "0 50%";
    line.style.transform = `rotate(${angle}rad)`;
    currentElement.appendChild(line);

    // 创建箭头头部
    const arrowHead = document.createElement("div");
    arrowHead.style.position = "absolute";
    arrowHead.style.width = "0";
    arrowHead.style.height = "0";
    arrowHead.style.borderTop = `${8}px solid transparent`;
    arrowHead.style.borderBottom = `${8}px solid transparent`;
    arrowHead.style.borderLeft = `${12}px solid ${strokeColor}`;
    arrowHead.style.left = `${endX}px`;
    arrowHead.style.top = `${endY}px`;
    arrowHead.style.transformOrigin = "0 50%";
    arrowHead.style.transform = `rotate(${angle}rad) translate(-4px, -8px)`;
    currentElement.appendChild(arrowHead);
  } else if (selectedTool === "pen") {
    // 获取当前工具的样式选项
    const strokeColor = currentOptions?.strokeColor || "#1296db";
    const strokeWidth = currentOptions?.strokeWidth || 2;

    // 获取 SVG 路径元素
    const path = currentElement.querySelector("path");
    if (path) {
      // 更新路径样式
      path.style.stroke = strokeColor;
      path.style.strokeWidth = strokeWidth.toString();

      // 获取当前路径数据
      const currentPath = path.getAttribute("d") || `M ${startX} ${startY}`;
      // 添加新的点
      const newPath = `${currentPath} L ${endX} ${endY}`;
      path.setAttribute("d", newPath);
    }
  }
};

// 结束绘制
const stopDrawing = () => {
  isDrawing = false;
  currentElement = null;

  if (!cuttingArea) return;
  if (cuttingArea) {
    cuttingArea.style.pointerEvents = "none";
  }
};

// 清理绘图容器
const clearDrawingContainer = () => {
  if (cuttingArea) {
    cuttingArea.innerHTML = "";
  }
};

// 添加鼠标事件监听器
document.addEventListener("mousedown", startDrawing);
document.addEventListener("mousemove", draw);
document.addEventListener("mouseup", stopDrawing);

// 通知 Background Script Content Script 已加载
console.log("Content Script 已加载");
chrome.runtime.sendMessage({
  type: "CONTENT_SCRIPT_LOADED",
});

// 修改页面 DOM（带类型约束）
const body = document.body;
if (body) {
  body.style.fontFamily = "Arial, sans-serif";
}

// 向 Background 发送消息
const message: Message = {
  type: "SET_USER_INFO",
  payload: { username: "ts-user" },
};
chrome.runtime.sendMessage(message);

// 监听来自 Popup/Background 的消息
chrome.runtime.onMessage.addListener(
  (message: ContentScriptMessage, sender, sendResponse) => {
    console.log("Content Script 收到消息：", message, "来自：", sender);

    try {
      switch (message.type) {
        case "START_SELECTION":
          console.log(
            "开始选择模式，工具：",
            message.tool,
            "选项：",
            message.options,
          );
          selectedTool = message.tool!;
          currentOptions = message.options || null;
          isDrawing = true;
          sendResponse({
            success: true,
            message: `已开始 ${message.tool} 选择模式`,
          });
          break;

        case "START_DRAWING":
          console.log(
            "开始绘制模式，工具：",
            message.tool,
            "选项：",
            message.options,
          );
          selectedTool = message.tool!;
          currentOptions = message.options || null;
          isDrawing = true;
          sendResponse({
            success: true,
            message: `已开始 ${message.tool} 绘制模式`,
          });
          break;

        case "START_EDITING":
          console.log(
            "开始编辑模式，工具：",
            message.tool,
            "选项：",
            message.options,
          );
          selectedTool = message.tool!;
          currentOptions = message.options || null;
          sendResponse({
            success: true,
            message: `已开始 ${message.tool} 编辑模式`,
          });
          break;

        case "STOP_EDITING":
          console.log("停止编辑模式");
          selectedTool = "";
          currentOptions = null;
          isDrawing = false;
          clearDrawingContainer();
          sendResponse({ success: true, message: "已停止编辑模式" });
          break;

        case "COPY_CONTENT":
          console.log("复制选中内容");
          // 这里可以添加实际的复制内容逻辑
          sendResponse({ success: true, message: "内容已复制到剪贴板" });
          break;

        default:
          console.warn("未知的消息类型：", message.type);
          sendResponse({ success: false, error: "未知的消息类型" });
      }
    } catch (error) {
      console.error("处理消息时出错：", error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // 返回 true 以表示我们将异步发送响应
    return true;
  },
);
