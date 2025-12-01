import React, { useState, useEffect } from "react";
import { Trash2, User } from "lucide-react";

const Avatar = ({ url, name }) => {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-200"
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white shadow-sm">
      <User className="w-6 h-6" />
    </div>
  );
};

export default function MessageBubble({ msg, isMe, onRecall }) {
  const [canRecall, setCanRecall] = useState(false);
  const isSystem = msg.type === "system";

  useEffect(() => {
    if (!isMe || isSystem) return;

    const checkRecallStatus = () => {
      const now = Date.now();
      const diff = now - msg.timestamp;
      const timeWindow = 120000;

      if (diff < timeWindow) {
        setCanRecall(true);
        const timeLeft = timeWindow - diff;
        const timer = setTimeout(() => {
          setCanRecall(false);
        }, timeLeft);
        return () => clearTimeout(timer);
      } else {
        setCanRecall(false);
      }
    };

    checkRecallStatus();
  }, [msg.timestamp, isMe, isSystem]);

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
          {msg.content}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex ${
        isMe ? "justify-end" : "justify-start"
      } mb-6 items-start`}
    >
      {/* 对方的头像在左边 */}
      {!isMe && (
        <div className="mr-3 flex-shrink-0 translate-y-[2px]">
          {" "}
          <Avatar url={msg.userAvatar} name={msg.userId} />
        </div>
      )}

      <div
        className={`flex ${
          isMe ? "justify-end" : "justify-start"
        } group max-w-[75%]`}
      >
        <div className={`flex items-end ${isMe ? "order-2" : "order-1"}`}>
          {/* 撤回按钮 */}
          {canRecall && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRecall();
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 mb-1 mx-1 text-gray-400 hover:text-red-500 self-center" // 按钮垂直居中
              title="撤回这条消息"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <div
            className={`flex flex-col ${isMe ? "items-end" : "items-start"} ${
              isMe ? "order-2" : "order-1"
            }`}
          >
            <div
              className={`px-4 py-2.5 rounded-2xl shadow-sm overflow-hidden text-sm leading-relaxed ${
                isMe
                  ? "bg-blue-400 text-white rounded-tr-none"
                  : "bg-white text-gray-800 rounded-tl-none"
              }`}
            >
              {msg.type === "text" && (
                <p className="break-words whitespace-pre-wrap">{msg.content}</p>
              )}
              {msg.type === "image" && (
                <img
                  src={msg.content}
                  alt="sent"
                  className="max-w-full rounded-lg"
                  loading="lazy"
                />
              )}
              {msg.type === "video" && (
                <video
                  src={msg.content}
                  controls
                  className="max-w-full rounded-lg"
                />
              )}
              {msg.type === "audio" && (
                <audio src={msg.content} controls className="max-w-[200px]" />
              )}
            </div>

            {/* 发送者信息和时间 */}
            <div className="text-[10px] text-gray-400 mt-1 flex items-center">
              {!isMe && (
                <span className="mr-1 font-medium text-gray-500">
                  {msg.userId}
                </span>
              )}
              <span>
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 自己的头像在右边 */}
      {isMe && (
        <div className="ml-3 flex-shrink-0 translate-y-[2px]">
          <Avatar url={msg.userAvatar} name={msg.userId} />
        </div>
      )}
    </div>
  );
}
