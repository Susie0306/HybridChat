import React from "react";
import { ArrowLeft } from "lucide-react";

export default function SearchResults({ results, keyword, onClose }) {
  return (
    <div className="absolute inset-0 bg-white z-30 flex flex-col">
      <div className="p-3 border-b flex items-center bg-gray-50">
        <button onClick={onClose} className="mr-2">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <span className="font-bold text-gray-700">搜索结果: "{keyword}"</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {results.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">未找到相关消息</div>
        ) : (
          results.map((msg, idx) => (
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
}
