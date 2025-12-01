import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  RefreshCw,
  Send,
  Image as ImageIcon,
  Video,
  Mic,
  Loader2,
  Users,
  Search,
  X,
  Smile,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import MessageBubble from "./MessageBubble";
import UserList from "./UserList";
import { UserButton } from "@clerk/clerk-react";
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
  const [inputVal, setInputVal] = useState("");
  const [showUserList, setShowUserList] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef(null);

  // 自动检测滚动条逻辑
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    // 如果内容高度 <= 容器高度，说明没有滚动条，且没有正在加载，且还有更多历史
    if (
      container.scrollHeight <= container.clientHeight &&
      !allHistoryLoaded &&
      !loadingHistory &&
      messages.length > 0
    ) {
      // 自动加载更多
      if (onLoadMore) onLoadMore();
    }
  }, [messages, allHistoryLoaded, loadingHistory, onLoadMore]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [inputVal]);
  const handleSend = () => {
    if (!inputVal.trim()) return;
    onSendMessage("text", inputVal);
    setInputVal("");
    setShowEmoji(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleFileSelect = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await onUploadFile(file);
    if (url) {
      onSendMessage(type, url);
    }
    e.target.value = "";
  };

  // 处理表情点击
  const onEmojiClick = (emojiData) => {
    // 将选中的表情追加到输入框
    setInputVal((prev) => prev + emojiData.emoji);
  };
  // 处理搜索提交
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchKeyword);
  };

  // 关闭搜索
  const closeSearch = () => {
    setShowSearch(false);
    setSearchKeyword("");
    onClearSearch();
  };

  // 渲染搜索结果视图
  const renderSearchResults = () => (
    <div className="absolute inset-0 bg-white z-30 flex flex-col">
      <div className="p-3 border-b flex items-center bg-gray-50">
        <button onClick={closeSearch} className="mr-2">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <span className="font-bold text-gray-700">
          搜索结果: "{searchKeyword}"
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {searchResults.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">未找到相关消息</div>
        ) : (
          searchResults.map((msg, idx) => (
            <div key={idx} className="border-b pb-2">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{msg.userId}</span>
                <span>{new Date(msg.timestamp).toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-800">{msg.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans relative overflow-hidden">
      {/* 搜索结果全屏覆盖 */}
      {showSearch && searchResults.length > 0 && renderSearchResults()}

      {/* Header */}
      <header className="bg-white shadow px-4 py-3 flex items-center justify-between sticky top-0 z-10 h-14">
        {showSearch ? (
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 flex items-center"
          >
            <input
              autoFocus
              className="flex-1 bg-gray-100 rounded-full px-4 py-1 text-sm outline-none"
              placeholder="搜索聊天记录..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <button type="button" onClick={closeSearch} className="ml-2 p-1">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </form>
        ) : (
          // 普通模式 Header
          <>
            <div className="flex items-center space-x-3">
              <button className="p-1 rounded-full hover:bg-gray-100">
                <ArrowLeft
                  className="w-6 h-6 text-gray-600"
                  onClick={() => window.location.reload()}
                />
              </button>
              <div>
                <h2 className="font-bold text-gray-800">{roomId}</h2>
                <p className="text-xs text-green-500 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  {onlineUsers ? onlineUsers.length : 1} 人在线
                </p>
              </div>
            </div>
            <div className="flex space-x-3 text-gray-600 items-center">
              <button onClick={() => setShowSearch(true)}>
                <Search className="w-5 h-5" />
              </button>
              <button onClick={() => setShowUserList(!showUserList)}>
                <Users
                  className={`w-5 h-5 ${showUserList ? "text-blue-400" : ""}`}
                />
              </button>
              <UserButton afterSignOutUrl="/" />
            </div>
          </>
        )}
      </header>

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

      {/* 表情选择面板 */}
      {showEmoji && (
        <div className="absolute bottom-16 left-2 z-30 shadow-2xl rounded-xl">
          {/* height 和 width 控制面板大小 */}
          <EmojiPicker
            onEmojiClick={onEmojiClick}
            width={300}
            height={350}
            searchDisabled={true}
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}

      {/* 底部输入区域 */}
      <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-end space-x-2">
        {/* 表情开关按钮 */}
        <button
          onClick={() => setShowEmoji(!showEmoji)}
          className={`p-2 rounded-full transition ${
            showEmoji
              ? "bg-yellow-100 text-yellow-600"
              : "hover:bg-gray-100 text-gray-500"
          }`}
        >
          <Smile className="w-6 h-6" />
        </button>

        {/* 文件选择区 */}
        <div className="flex space-x-1">
          {/* 图片按钮: 支持 png, jpg, gif */}
          <label
            className={`cursor-pointer p-2 hover:bg-gray-100 rounded-full text-gray-500 ${
              isUploading ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <input
              type="file"
              accept="image/*" // 这包括了 image/gif
              className="hidden"
              onChange={(e) => handleFileSelect(e, "image")}
              disabled={isUploading}
            />
            <ImageIcon className="w-6 h-6" />
          </label>

          <label
            className={`cursor-pointer p-2 hover:bg-gray-100 rounded-full text-gray-500 ${
              isUploading ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e, "video")}
              disabled={isUploading}
            />
            <Video className="w-6 h-6" />
          </label>

          <label
            className={`cursor-pointer p-2 hover:bg-gray-100 rounded-full text-gray-500 ${
              isUploading ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e, "audio")}
              disabled={isUploading}
            />
            <Mic className="w-6 h-6" />
          </label>
        </div>

        {/* 文本输入框 */}
        <div className="flex-1 bg-gray-100 rounded-xl px-4 py-2 flex items-center">
          <textarea
            ref={textareaRef}
            className="bg-transparent flex-1 outline-none text-sm text-gray-800 placeholder-gray-400 resize-none scrollbar-hide"
            style={{ minHeight: "24px", maxHeight: "120px", overflowY: "auto" }}
            rows={1}
            placeholder="发送消息...(Shift+Enter 换行)"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onFocus={() => setShowEmoji(false)} // 输入文字时自动收起表情面板
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!inputVal.trim()}
          className="bg-blue-400 text-white p-2 rounded-full hover:bg-blue-500 disabled:bg-blue-200 transition shadow-md"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
