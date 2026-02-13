export type MessageType =
  | "rectangle"
  | "circle"
  | "arrow"
  | "pen"
  | "mosaic"
  | "text"
  | "exit"
  | "copy";

export type Message = {
  type: "GET_USER_INFO" | "SET_USER_INFO";
  payload: {
    username: string;
  };
};

export type ToolBarOption = Partial<{
  strokeColor: string;
  strokeWidth: number;
  fillColor: string;
  isEnabled: boolean;
  brushSize: number;
  fontSize: number;
  fontColor: string;
}>;


// 定义内容脚本可以处理的消息类型
export type ContentScriptMessage = {
  type:
    | "START_SELECTION"
    | "START_DRAWING"
    | "START_EDITING"
    | "STOP_EDITING"
    | "COPY_CONTENT";
  tool?: string;
  options?: ToolBarOption;
};