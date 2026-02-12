import React, { Fragment } from "react";
import "./App.scss";

interface ToolbarItem {
  id: number;
  name: string;
  imageUrl: string;
}

const toolbarListCfg: ToolbarItem[] = [
  {
    id: 1,
    name: "矩形",
    imageUrl: "icons/rectangle.svg",
  },
  {
    id: 2,
    name: "椭圆",
    imageUrl: "icons/circle.svg",
  },
  {
    id: 3,
    name: "箭头",
    imageUrl: "icons/arrow.svg",
  },
  {
    id: 4,
    name: "画笔",
    imageUrl: "icons/pen.svg",
  },
  {
    id: 5,
    name: "马赛克",
    imageUrl: "icons/mosaic.svg",
  },
  {
    id: 6,
    name: "文本",
    imageUrl: "icons/text.svg",
  },
  {
    id: 7,
    name: "退出",
    imageUrl: "icons/exit.svg",
  },
  {
    id: 8,
    name: "复制",
    imageUrl: "icons/copy.svg",
  },
];

/**
 * 计算图标的样式大小
 * @param rowId
 * @returns
 */
const getComputedStyle = (rowId: ToolbarItem["id"]): React.CSSProperties => {
  if ([1, 6, 7, 8].includes(rowId)) {
    return {
      width: "36px",
      height: "36px",
      objectFit: "contain",
    };
  }
  return {
    width: "30px",
    height: "30px",
    objectFit: "contain",
  };
};

const handleToolBarItemClick =(name:ToolbarItem['name'])=>{
  if(name === "矩形"){
    chrome.runtime.sendMessage({
      type: "rectangle",
    });
  }else if(name === "椭圆"){
    chrome.runtime.sendMessage({
      type: "circle",
    });
  }else if(name === "箭头"){
    chrome.runtime.sendMessage({
      type: "arrow",
    });
  }else if(name === "画笔"){
    chrome.runtime.sendMessage({
      type: "pen",
    });
  }else if(name === "马赛克"){
    chrome.runtime.sendMessage({
      type: "mosaic",
    });
  }else if(name === "文本"){
    chrome.runtime.sendMessage({
      type: "text",
    });
  }else if(name === "退出"){
    chrome.runtime.sendMessage({
      type: "exit",
    });
  }else if(name === "复制"){
    chrome.runtime.sendMessage({
      type: "copy",
    });
  }
}

const GenerateToolbarList: React.FC = () => {
  return (
    <div className="toolbar-list">
      {toolbarListCfg.map((row) => {
        return (
          <div
            key={row.id}
            className="toolbar-item"
            title={row.name}
            onClick={handleToolBarItemClick(row.name)}
          >
            <img
              style={{
                ...getComputedStyle(row.id),
                padding: "0px 5px",
              }}
              src={row.imageUrl}
              alt={row.name}
            />
          </div>
        );
      })}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Fragment>
      <GenerateToolbarList />
    </Fragment>
  );
};

export default App;
