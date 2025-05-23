import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { PlusCircleIcon, Search, Users } from "lucide-react";
import ChatSearch from "./ChatSearch";        


const SidebarChats = () => {

  // Selectors for reactive parts
  const lastMessages = useChatStore((state) => state.lastMessages);
  const lastMessageTimestamps = useChatStore((state) => state.lastMessageTimestamps);

  // Destructure the rest
  const { getUsers, getMessages, users, selectedUser, setSelectedUser, isUsersLoading, setContactSelected } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);


  useEffect(() => {
    getUsers();
  }, [getUsers]);

  useEffect(() => {
    users.forEach(user => {
      if (lastMessages[user._id] === undefined) {
        getMessages(user._id); // Fetch messages if no last message is available
      }
    }); 
  }, [users, getMessages, lastMessages]);

  const nonBotUsers = users.filter(
    (user) => user.is_bot !== true && user.is_bot !== "true"
  );
  
  const filteredUsers = showOnlineOnly
    ? nonBotUsers.filter((user) => onlineUsers.includes(user._id))
    : nonBotUsers;

  const sortedUsers = [...filteredUsers].sort((a, b) => {
      return (lastMessageTimestamps[b._id] || 0) - (lastMessageTimestamps[a._id] || 0);
    });

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
      <div className="flex items-center gap-2">
        <Users className="size-5" />
        <span className="font-medium hidden lg:block text-2xl">Chats</span>
          <button className="ml-auto hidden lg:block"   onClick={() => setContactSelected(true)} >
            <PlusCircleIcon className="size-5 "  />
          </button>
      </div>

      <div className="mt-3 hidden lg:flex items-center gap-2">
        <label className="input">
          <Search className="size-4"/>
          <input type="search" required placeholder="Search"/>
        </label>
      </div>

        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {sortedUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="relative mx-auto lg:mx-0 flex-shrink-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.fullName}</div>
                <div className="text-sm text-zinc-400 truncate">
                  {lastMessages[user._id]?.text || null}
                </div>
            </div>
          </button>
        ))}

        {sortedUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>
    </aside>
  );
};
export default SidebarChats;