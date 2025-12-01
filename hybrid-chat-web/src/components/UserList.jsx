import React from "react";
import { User, X } from "lucide-react";

export default function UserList({ users, onClose }) {
  return (
    <div className="absolute inset-y-0 right-0 w-64 bg-white shadow-xl z-20 transform transition-transform duration-300 ease-in-out">
      <div className="p-4 border-b flex justify-between items-center bg-blue-50">
        <h3 className="font-bold text-gray-700 flex items-center">
          <User className="w-4 h-4 mr-2" />
          在线成员 ({users.length})
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-blue-100 rounded-full"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <div className="overflow-y-auto h-full p-2">
        {users.map((user, idx) => (
          <div
            key={idx}
            className="flex items-center p-3 hover:bg-gray-50 rounded-lg mb-1"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">
              {user.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-gray-700 font-medium truncate">
              {user}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
