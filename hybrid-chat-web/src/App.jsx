import React, { useState, useEffect } from "react";
import { SignedIn, SignedOut, SignIn, useUser } from "@clerk/clerk-react";
import { Bridge } from "./utils/bridge";
import { useChat } from "./hooks/useChat";
import ChatRoom from "./components/ChatRoom";
import RoomSelector from "./components/RoomSelector"; // [新增]

export default function HybridChatApp() {
  const [inChat, setInChat] = useState(false);
  const [roomId, setRoomId] = useState("group1");
  const [deviceInfo] = useState(() => Bridge.getDeviceId());

  const { user, isLoaded } = useUser();

  useEffect(() => {
    Bridge.requestPermissions();
  }, []);

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

      <SignedIn>
        {!inChat ? (
          <RoomSelector
            user={user}
            roomId={roomId}
            setRoomId={setRoomId}
            onEnter={handleEnterRoom}
          />
        ) : (
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
