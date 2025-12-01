import React, { useState, useEffect } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import MessageBubble from "./MessageBubble";
import UserList from "./UserList";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import SearchResults from "./SearchResults";

export default function ChatRoom({
  userId,
  roomId,
  messages,
  onlineUsers,
  loadingHistory,
  allHistoryLoaded,
  isUploading,
  searchResults = [],
  onSearch = () => {},
  onClearSearch = () => {},
  messagesEndRef,
  chatContainerRef,
  onSendMessage,
  onRecallMessage,
  onUploadFile,
  onScroll,
  onLoadMore,
}) {
  const [showUserList, setShowUserList] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  // 自动检测滚动条逻辑
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    if (
      container.scrollHeight <= container.clientHeight &&
      !allHistoryLoaded &&
      !loadingHistory &&
      messages.length > 0
    ) {
      if (onLoadMore) onLoadMore();
    }
  }, [messages, allHistoryLoaded, loadingHistory, onLoadMore]);

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans relative overflow-hidden">
      {/* 搜索结果全屏覆盖 */}
      {showSearch && searchResults.length > 0 && (
        <SearchResults
          results={searchResults}
          keyword={searchKeyword}
          onClose={() => {
            setShowSearch(false);
            setSearchKeyword("");
            onClearSearch();
          }}
        />
      )}

      {/* Header */}
      <ChatHeader
        roomId={roomId}
        onlineCount={onlineUsers ? onlineUsers.length : 1}
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        searchKeyword={searchKeyword}
        setSearchKeyword={setSearchKeyword}
        onSearch={onSearch}
        onClearSearch={onClearSearch}
        showUserList={showUserList}
        setShowUserList={setShowUserList}
      />

      <div className="bg-indigo-50 text-indigo-600 text-xs py-1.5 text-center border-b border-indigo-100 animate-in slide-in-from-top duration-500">
        （@DeepSeek 可以召唤AI加入你们的聊天哦~）
      </div>

      {/* 用户列表侧边栏 */}
      {showUserList && (
        <div className="absolute inset-0 z-20 flex justify-end">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setShowUserList(false)}
          ></div>
          <UserList
            users={onlineUsers || []}
            onClose={() => setShowUserList(false)}
          />
        </div>
      )}

      {/* 消息列表 */}
      <div
        ref={chatContainerRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {loadingHistory && (
          <div className="flex justify-center py-2">
            <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        )}
        {allHistoryLoaded && messages.length > 0 && (
          <div className="text-center text-xs text-gray-400 py-2">
            -- 没有更多消息了 --
          </div>
        )}

        {messages.map((msg, idx) => (
          <MessageBubble
            key={idx}
            msg={msg}
            isMe={msg.userId === userId}
            onRecall={() => onRecallMessage && onRecallMessage(msg.id)}
          />
        ))}

        {isUploading && (
          <div className="flex justify-end">
            <div className="bg-blue-400 text-white px-4 py-2 rounded-2xl rounded-br-none shadow-sm flex items-center space-x-2 opacity-70">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>发送中...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 底部输入区域 */}
      <ChatInput
        onSendMessage={onSendMessage}
        onUploadFile={onUploadFile}
        isUploading={isUploading}
      />
    </div>
  );
}
