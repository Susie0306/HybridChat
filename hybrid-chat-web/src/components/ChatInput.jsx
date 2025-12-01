import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Image as ImageIcon,
  Video,
  Mic,
  Smile,
  Plus,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";

const FileUploadButton = ({
  icon,
  type,
  accept,
  onSelect,
  isUploading,
  className = "",
}) => {
  const Icon = icon;

  return (
    <label
      className={`cursor-pointer p-2 hover:bg-gray-100 rounded-full text-gray-500 flex items-center justify-center ${
        isUploading ? "opacity-50 pointer-events-none" : ""
      } ${className}`}
    >
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onSelect(e, type)}
        disabled={isUploading}
      />
      {Icon && <Icon className="w-6 h-6" />}
    </label>
  );
};

export default function ChatInput({
  onSendMessage,
  onUploadFile,
  isUploading,
}) {
  const [inputVal, setInputVal] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const textareaRef = useRef(null);

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
    setShowPlusMenu(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleFileSelect = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setShowPlusMenu(false);
    const url = await onUploadFile(file);
    if (url) {
      onSendMessage(type, url);
    }
    e.target.value = "";
  };

  const onEmojiClick = (emojiData) => {
    setInputVal((prev) => prev + emojiData.emoji);
  };

  return (
    <>
      {/* 表情选择器 */}
      {showEmoji && (
        <div className="absolute bottom-20 left-2 z-30 shadow-2xl rounded-xl">
          <EmojiPicker
            onEmojiClick={onEmojiClick}
            width={300}
            height={350}
            searchDisabled={true}
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}

      {/* 移动端加号弹出的菜单 */}
      {showPlusMenu && (
        <div className="absolute bottom-16 left-12 z-30 bg-white rounded-xl shadow-xl border border-gray-100 p-2 flex gap-2 animate-in slide-in-from-bottom-2 duration-200">
          <FileUploadButton
            type="video"
            icon={Video}
            accept="video/*"
            onSelect={handleFileSelect}
            isUploading={isUploading}
          />
          <FileUploadButton
            type="audio"
            icon={Mic}
            accept="audio/*"
            onSelect={handleFileSelect}
            isUploading={isUploading}
          />
        </div>
      )}

      {/* 底部栏容器 */}
      <div className="bg-white px-3 py-3 border-t border-gray-200 flex items-end space-x-2 w-full max-w-[100vw] box-border pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        {/* 表情按钮 */}
        <button
          onClick={() => {
            setShowEmoji(!showEmoji);
            setShowPlusMenu(false);
          }}
          className={`p-2 rounded-full transition flex-shrink-0 ${
            showEmoji
              ? "bg-yellow-100 text-yellow-600"
              : "hover:bg-gray-100 text-gray-500"
          }`}
        >
          <Smile className="w-6 h-6" />
        </button>

        {/* 功能按钮区 */}
        <div className="flex space-x-1 flex-shrink-0">
          {/* 图片按钮：一直显示 */}
          <FileUploadButton
            type="image"
            icon={ImageIcon}
            accept="image/*"
            onSelect={handleFileSelect}
            isUploading={isUploading}
          />

          {/* [PC布局] 屏幕宽时(>sm)显示: 视频, 音频 */}
          <div className="hidden sm:flex space-x-1">
            <FileUploadButton
              type="video"
              icon={Video}
              accept="video/*"
              onSelect={handleFileSelect}
              isUploading={isUploading}
            />
            <FileUploadButton
              type="audio"
              icon={Mic}
              accept="audio/*"
              onSelect={handleFileSelect}
              isUploading={isUploading}
            />
          </div>

          {/* [移动端布局] 屏幕窄时(<sm)显示: 加号按钮 */}
          <button
            onClick={() => {
              setShowPlusMenu(!showPlusMenu);
              setShowEmoji(false);
            }}
            className={`p-2 rounded-full transition sm:hidden ${
              showPlusMenu
                ? "bg-gray-200 text-gray-700"
                : "hover:bg-gray-100 text-gray-500"
            }`}
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* 输入框 */}
        <div className="flex-1 bg-gray-100 rounded-xl px-4 py-2 flex items-center min-w-0">
          <textarea
            ref={textareaRef}
            className="bg-transparent flex-1 outline-none text-sm text-gray-800 placeholder-gray-400 resize-none scrollbar-hide"
            style={{ minHeight: "24px", maxHeight: "120px", overflowY: "auto" }}
            rows={1}
            placeholder="发送消息..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onFocus={() => {
              setShowEmoji(false);
              setShowPlusMenu(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>

        {/* 发送按钮 */}
        <button
          onClick={handleSend}
          disabled={!inputVal.trim()}
          className="bg-blue-400 text-white p-2 rounded-full hover:bg-blue-500 disabled:bg-blue-200 transition shadow-md flex-shrink-0"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </>
  );
}
