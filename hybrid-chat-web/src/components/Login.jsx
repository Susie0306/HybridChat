import React from "react";

export default function Login({
  userId,
  setUserId,
  roomId,
  setRoomId,
  onLogin,
  deviceInfo,
}) {
  return (
    <div className="flex fixed inset-0 items-center justify-center h-screen bg-gray-100 p-4 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">
          Hybrid Chat
        </h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              用户 ID
            </label>
            <input
              type="text"
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="输入你的名字"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              房间 ID
            </label>
            <input
              type="text"
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>
          <button
            onClick={onLogin}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            进入聊天
          </button>
          <div className="text-xs text-gray-500 text-center mt-4">
            设备标识: {deviceInfo}
          </div>
        </div>
      </div>
    </div>
  );
}
