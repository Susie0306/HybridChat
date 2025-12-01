import React from "react";
import { User, X } from "lucide-react";

export default function UserList({ users, onClose }) {
  return (
    <div className="absolute inset-y-0 right-0 w-64 bg-white shadow-xl z-20 transform transition-transform duration-300 ease-in-out border-l border-gray-100">
      <div className="p-4 border-b flex justify-between items-center bg-blue-50">
        <h3 className="font-bold text-blue-600 flex items-center">
          <User className="w-4 h-4 mr-2" />
          在线成员 ({users.length})
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-blue-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-blue-400" />
        </button>
      </div>
      <div className="overflow-y-auto h-full p-3 space-y-1">
        {users.map((user, idx) => (
          <div
            key={idx}
            className="flex items-center p-2 hover:bg-gray-50 rounded-xl transition-colors group"
          >
            {/* 头像显示逻辑 */}
            {user.userAvatar ? (
              <img
                src={user.userAvatar}
                alt={user.userId}
                className="w-9 h-9 rounded-full mr-3 object-cover border border-gray-200 shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 font-bold mr-3 shadow-sm">
                {user.userId ? user.userId.charAt(0).toUpperCase() : "?"}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <span className="text-sm text-gray-700 font-medium truncate block">
                {user.userId}
              </span>
            </div>

            {/* 在线小绿点 */}
            <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
