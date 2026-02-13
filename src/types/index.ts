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


