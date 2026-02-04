import { useRef, useState } from "react";

export const App = () => {
  const [toolbarPos, setToolbarPos] = useState({ x: 0, y: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleToolbarMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); // 避免触发底层截图的框选事件
    dragStart.current = {
      x: e.clientX - toolbarPos.x,
      y: e.clientY - toolbarPos.y,
    };
    document.addEventListener("mousemove", handleToolbarMouseMove);
    document.addEventListener("mouseup", handleToolbarMouseUp);
  };

  const handleToolbarMouseMove = (e: MouseEvent) => {
    if (!previewRef.current || !toolbarRef.current) return;
    const previewRect = previewRef.current.getBoundingClientRect();
    const toolbarRect = toolbarRef.current.getBoundingClientRect();
    let newX = e.clientX - dragStart.current.x;
    let newY = e.clientY - dragStart.current.y;

    // 限制在预览图内
    newX = Math.max(0, Math.min(newX, previewRect.width - toolbarRect.width));
    newY = Math.max(0, Math.min(newY, previewRect.height - toolbarRect.height));
    setToolbarPos({ x: newX, y: newY });
  };

  const handleToolbarMouseUp = () => {
    document.removeEventListener("mousemove", handleToolbarMouseMove);
    document.removeEventListener("mouseup", handleToolbarMouseUp);
  };

  // 在 JSX 中使用
  return(
     <div className="screenshot-preview" ref={previewRef}>
    {/* <img src={screenshotUrl} alt="截图预览" /> */}
    <div
      className="screenshot-toolbar"
      ref={toolbarRef}
      style={{ left: `${toolbarPos.x}px`, top: `${toolbarPos.y}px` }}
      onMouseDown={handleToolbarMouseDown}
    >
      {/* 工具栏按钮：裁剪、标注、下载等 */}
    </div>
  </div>
  )
};
