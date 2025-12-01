// JSBridge 封装层
export const Bridge = {
  getDeviceId: () => {
    if (window.AndroidChatInterface) {
      return window.AndroidChatInterface.getDeviceId();
    }
    // 浏览器环境下的模拟 ID
    return "Web-Browser-Dev-" + Math.floor(Math.random() * 1000);
  },
  showToast: (msg) => {
    if (window.AndroidChatInterface) {
      window.AndroidChatInterface.showToast(msg);
    } else {
      console.log(`[模拟 Native Toast]: ${msg}`);
    }
  },
  requestPermissions: () => {
    if (window.AndroidChatInterface) {
      window.AndroidChatInterface.requestPermissions();
    } else {
      console.log("[模拟 Native]: 已请求麦克风/相机权限");
    }
  },
};
