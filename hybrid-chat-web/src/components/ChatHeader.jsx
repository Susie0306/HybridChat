import React from "react";
import { ArrowLeft, Search, Users, X } from "lucide-react";
import { UserButton } from "@clerk/clerk-react";

export default function ChatHeader({
  roomId,
  onlineCount,
  showSearch,
  setShowSearch,
  searchKeyword,
  setSearchKeyword,
  onSearch,
  onClearSearch,
  showUserList,
  setShowUserList,
}) {
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchKeyword);
  };

  const closeSearch = () => {
    setShowSearch(false);
    setSearchKeyword("");
    onClearSearch();
  };

  return (
    <header className="bg-white shadow px-4 py-3 pt-[env(safe-area-inset-top)] flex items-center justify-between sticky top-0 z-10 w-full box-border min-h-[3.5rem]">
      {showSearch ? (
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 flex items-center mt-2"
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
        <div className="flex items-center justify-between w-full mt-1">
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
                {onlineCount} 人在线
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
        </div>
      )}
    </header>
  );
}
