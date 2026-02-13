import { Message } from '@/types';

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

// 定义内容脚本可以处理的消息类型
type ContentScriptMessage = {
  type: 'START_SELECTION' | 'START_DRAWING' | 'START_EDITING' | 'STOP_EDITING' | 'COPY_CONTENT';
  tool?: string;
  options?: RectangleOptions | CircleOptions | ArrowOptions | PenOptions | MosaicOptions | TextOptions | StopOptions;
};

// 全局变量
let isDrawing = false;
let currentTool = "";
let startX = 0;
let startY = 0;
let currentElement: HTMLElement | null = null;
let drawingContainer: HTMLElement | null = null;

// 创建绘图容器
const createDrawingContainer = (): HTMLElement => {
  if (!drawingContainer) {
    drawingContainer = document.createElement("div");
    drawingContainer.id = "drawing-container";
    drawingContainer.style.position = "fixed";
    drawingContainer.style.top = "0";
    drawingContainer.style.left = "0";
    drawingContainer.style.width = "100%";
    drawingContainer.style.height = "100%";
    drawingContainer.style.pointerEvents = "none";
    drawingContainer.style.zIndex = "9999";
    document.body.appendChild(drawingContainer);
  }
  return drawingContainer;
};

// 开始绘制
const startDrawing = (e: MouseEvent) => {
  if (!isDrawing || !currentTool) return;
  
  const container = createDrawingContainer();
  container.style.pointerEvents = "auto";
  
  startX = e.clientX;
  startY = e.clientY;
  
  // 根据工具类型创建不同的元素
  if (currentTool === "rectangle" || currentTool === "circle") {
    currentElement = document.createElement("div");
    currentElement.style.position = "absolute";
    currentElement.style.border = "2px solid red";
    currentElement.style.backgroundColor = "rgba(255, 0, 0, 0.2)";
    currentElement.style.left = `${startX}px`;
    currentElement.style.top = `${startY}px`;
    currentElement.style.width = "0";
    currentElement.style.height = "0";
    container.appendChild(currentElement);
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
  if (currentTool === "rectangle") {
    currentElement.style.width = `${width}px`;
    currentElement.style.height = `${height}px`;
    currentElement.style.left = `${left}px`;
    currentElement.style.top = `${top}px`;
  } else if (currentTool === "circle") {
    const radius = Math.sqrt(width * width + height * height) / 2;
    currentElement.style.width = `${radius * 2}px`;
    currentElement.style.height = `${radius * 2}px`;
    currentElement.style.borderRadius = "50%";
    currentElement.style.left = `${left + width / 2 - radius}px`;
    currentElement.style.top = `${top + height / 2 - radius}px`;
  }
};

// 结束绘制
const stopDrawing = () => {
  isDrawing = false;
  currentElement = null;
  
  if (drawingContainer) {
    drawingContainer.style.pointerEvents = "none";
  }
};

// 清理绘图容器
const clearDrawingContainer = () => {
  if (drawingContainer) {
    drawingContainer.innerHTML = "";
  }
};

// 添加鼠标事件监听器
document.addEventListener("mousedown", startDrawing);
document.addEventListener("mousemove", draw);
document.addEventListener("mouseup", stopDrawing);

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
        currentTool = message.tool!;
        isDrawing = true;
        sendResponse({ success: true, message: `已开始 ${message.tool} 选择模式` });
        break;
        
      case 'START_DRAWING':
        console.log('开始绘制模式，工具：', message.tool, '选项：', message.options);
        currentTool = message.tool!;
        isDrawing = true;
        sendResponse({ success: true, message: `已开始 ${message.tool} 绘制模式` });
        break;
        
      case 'START_EDITING':
        console.log('开始编辑模式，工具：', message.tool, '选项：', message.options);
        currentTool = message.tool!;
        sendResponse({ success: true, message: `已开始 ${message.tool} 编辑模式` });
        break;
        
      case 'STOP_EDITING':
        console.log('停止编辑模式');
        currentTool = "";
        isDrawing = false;
        clearDrawingContainer();
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