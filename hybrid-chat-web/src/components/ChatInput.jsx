import React, { useState, useRef, useEffect } from "react";
import { Send, Image as ImageIcon, Video, Mic, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

export default function ChatInput({
  onSendMessage,
  onUploadFile,
  isUploading,
}) {
  const [inputVal, setInputVal] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
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

  const onEmojiClick = (emojiData) => {
    setInputVal((prev) => prev + emojiData.emoji);
  };

  return (
    <>
      {showEmoji && (
        <div className="absolute bottom-16 left-2 z-30 shadow-2xl rounded-xl">
          <EmojiPicker
            onEmojiClick={onEmojiClick}
            width={300}
            height={350}
            searchDisabled={true}
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}

      <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-end space-x-2">
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

        <div className="flex space-x-1">
          <label
            className={`cursor-pointer p-2 hover:bg-gray-100 rounded-full text-gray-500 ${
              isUploading ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <input
              type="file"
              accept="image/*"
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

        <div className="flex-1 bg-gray-100 rounded-xl px-4 py-2 flex items-center">
          <textarea
            ref={textareaRef}
            className="bg-transparent flex-1 outline-none text-sm text-gray-800 placeholder-gray-400 resize-none scrollbar-hide"
            style={{ minHeight: "24px", maxHeight: "120px", overflowY: "auto" }}
            rows={1}
            placeholder="发送消息...(Shift+Enter 换行)"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onFocus={() => setShowEmoji(false)}
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
    </>
  );
}
