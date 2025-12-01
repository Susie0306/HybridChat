import React from "react";
import { UserButton } from "@clerk/clerk-react";
import { LogIn } from "lucide-react";

export default function RoomSelector({ user, roomId, setRoomId, onEnter }) {
  return (
    <div className="flex flex-col h-screen items-center justify-center bg-gray-50 relative">
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
            <span className="absolute bottom-4 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
          </div>

          <h2 className="text-2xl font-bold text-gray-800">
            欢迎回来, {user?.firstName || "User"}!
          </h2>
          <p className="text-gray-500 text-sm mt-2">准备好加入聊天了吗？</p>
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
            onClick={onEnter}
            className="w-full bg-blue-400 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all transform active:scale-[0.98] flex items-center justify-center shadow-lg shadow-blue-100"
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
  );
}
