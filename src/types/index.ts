// 消息通信类型
export type MessageType = 'GET_USER_INFO' | 'SET_USER_INFO';

export interface Message {
  type: MessageType;
  payload?: any; // 可根据实际需求细化类型，如 { name: string }
}

// 存储数据类型（chrome.storage 中保存的数据）
export interface StorageData {
  username: string;
  theme: 'light' | 'dark';
}