import React, { Fragment } from "react";
import "./App.scss";
import { MessageType } from "@/types";
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
const handleToolBarItemClick = (name: ToolbarItem["name"]) => {
  console.log(`点击了工具栏: ${name}`);

  let messageType: MessageType;

  switch (name) {
    case "矩形":
      messageType = "rectangle";
      break;
    case "椭圆":
      messageType = "circle";
      break;
    case "箭头":
      messageType = "arrow";
      break;
    case "画笔":
      messageType = "pen";
      break;
    case "马赛克":
      messageType = "mosaic";
      break;
    case "文本":
      messageType = "text";
      break;
    case "退出":
      messageType = "exit";
      break;
    case "复制":
      messageType = "copy";
      break;
    default:
      console.warn(`未知的工具栏项: ${name}`);
      return;
  }

  sendMessageToBackGround(messageType);
};

/**
 * 发送消息到 Background Script 并处理响应
 * @param messageType
 */
const sendMessageToBackGround = (messageType: MessageType) => {
  chrome.runtime.sendMessage({ type: messageType }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("消息传递失败:", chrome.runtime.lastError);
      // 这里可以添加用户反馈，例如显示错误提示
    } else {
      console.log("消息传递成功:", response);
      // 这里可以添加用户反馈，例如显示成功提示
    }
  });
};

const GenerateToolbarList: React.FC = () => {
  return (
    <div className="toolbar-list">
      {toolbarListCfg.map((row) => {
        return (
          <div
            key={row.id}
            className="toolbar-item"
            title={row.name}
            onClick={() => handleToolBarItemClick(row.name)}
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
