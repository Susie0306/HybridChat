import React, { useState, useEffect } from "react";
import {
  SignedIn,
  SignedOut,
  SignIn,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import { Bridge } from "./utils/bridge";
import { useChat } from "./hooks/useChat";
import ChatRoom from "./components/ChatRoom";
import { LogIn } from "lucide-react";

export default function HybridChatApp() {
  const [inChat, setInChat] = useState(false);
  const [roomId, setRoomId] = useState("group1");
  const [deviceInfo] = useState(() => Bridge.getDeviceId());

  // 获取 Clerk 用户信息
  const { user, isLoaded } = useUser();

  useEffect(() => {
    Bridge.requestPermissions();
  }, []);

  // 构造传递给 useChat 的 userId 和 avatar
  const currentUserId = user ? user.firstName || user.username || user.id : "";
  const currentUserAvatar = user ? user.imageUrl : "";

  const {
    messages,
    onlineUsers,
    loadingHistory,
    allHistoryLoaded,
    isUploading,
    searchResults,
    doSearch,
    clearSearch,
    messagesEndRef,
    chatContainerRef,
    connectToChat,
    sendMessage,
    recallMessage,
    uploadFile,
    fetchHistory,
  } = useChat(currentUserId, currentUserAvatar, roomId, deviceInfo);

  const handleEnterRoom = () => {
    if (!roomId.trim()) return;
    connectToChat();
    setInChat(true);
  };

  const handleScroll = (e) => {
    if (e.target.scrollTop === 0) {
      fetchHistory();
    }
  };

  if (!isLoaded)
    return (
      <div className="flex h-screen items-center justify-center">加载中...</div>
    );

  return (
    <>
      {/* 未登录状态 */}
      <SignedOut>
        <div className="flex flex-col h-screen items-center justify-center bg-gray-100 p-4">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-blue-400 mb-2">
              HybridChat
            </h1>
            <p className="text-gray-500">请先登录以继续</p>
          </div>
          <SignIn />
        </div>
      </SignedOut>

      {/* 已登录状态 */}
      <SignedIn>
        {!inChat ? (
          // 选择房间界面
          <div className="flex flex-col h-screen items-center justify-center bg-gray-50 relative">
            {/* 右上角用户按钮 */}
            <div className="absolute top-4 right-4">
              <UserButton afterSignOutUrl="/" />
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md transition-all hover:shadow-2xl">
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <img
                    src={user?.imageUrl}
                    alt="Profile"
                    className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-blue-50 shadow-md object-cover"
                  />
                  {/* 在头像右下角加一个小绿点表示在线 */}
                  <span className="absolute bottom-4 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                </div>

                <h2 className="text-2xl font-bold text-gray-800">
                  欢迎回来, {user?.firstName || "User"}!
                </h2>
                <p className="text-gray-500 text-sm mt-2">
                  准备好加入聊天了吗？
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                    房间号 (Room ID)
                  </label>
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all bg-gray-50 outline-none"
                    placeholder="例如: group1"
                  />
                </div>

                <button
                  onClick={handleEnterRoom}
                  className="w-full bg-blue-400 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all transform active:scale-[0.98] flex items-center justify-center shadow-lg shadow-blue-200"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  进入聊天室
                </button>
              </div>
            </div>

            <p className="mt-8 text-xs text-gray-400">
              Powered by React, Clerk & Neon
            </p>
          </div>
        ) : (
          // 聊天室界面
          <ChatRoom
            userId={currentUserId}
            roomId={roomId}
            messages={messages}
            onlineUsers={onlineUsers}
            loadingHistory={loadingHistory}
            allHistoryLoaded={allHistoryLoaded}
            isUploading={isUploading}
            searchResults={searchResults}
            onSearch={doSearch}
            onClearSearch={clearSearch}
            messagesEndRef={messagesEndRef}
            chatContainerRef={chatContainerRef}
            onSendMessage={sendMessage}
            onRecallMessage={recallMessage}
            onUploadFile={uploadFile}
            onScroll={handleScroll}
            onLoadMore={fetchHistory}
          />
        )}
      </SignedIn>
    </>
  );
}
