import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime, formatMessageDate } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    setBotTyping,
    botTyping,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  useEffect(() => {
    const socket = io();

    // Listen for the bot typing event and update the botTyping state
    socket.on("botTyping", (data) => {
      if (data.senderId === process.env.BOT_USER_ID) {
        setBotTyping(data.typing); // Set bot typing to true or false
      }
    });

    return () => {
      socket.off("botTyping"); // Clean up the socket listener
    };
  }, [setBotTyping]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }


  

  // Group messages by date
  const groupedMessages = messages.reduce((acc, message) => {
    const messageDate = formatMessageDate(message.createdAt);
    if (!acc[messageDate]) {
      acc[messageDate] = [];
    }
    acc[messageDate].push(message);
    return acc;
  }, {});

  const hasMessages = messages.length > 0;

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
        {hasMessages ? (
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date} className="relative">
              {/* Sticky Date Header */}
              <div className="sticky top-0 z-10 flex justify-center">
                <span className="bg-base-200 text-base-content/70 px-4 py-1 text-sm rounded-lg shadow-md">
                  {date}
                </span>
              </div>

              {/* Messages */}
              {msgs.map((message) => (
                <div
                  key={message._id}
                  className={`chat ${
                    message.senderId === authUser._id ? "chat-end " : "chat-start "
                  }`}
                  ref={messageEndRef}
                >
                  <div className="chat-image avatar">
                    <div className="size-10 rounded-full border ">
                      <img
                        src={
                          message.senderId === authUser._id
                            ? authUser.profilePic || "/avatar.png"
                            : selectedUser.profilePic || "/avatar.png"
                        }
                        alt="profile pic"
                      />
                    </div>
                  </div>
                  <div className="chat-header mb-1 ">
                    <time className="text-xs opacity-50 ml-1">
                      {formatMessageTime(message.createdAt)}
                    </time>
                  </div>
                  <div className="chat-bubble flex flex-col shadow-md">
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Attachment"
                        className="sm:max-w-[200px] rounded-md mb-2"
                      />
                    )}
                    {message.text && <p>{message.text}</p>}
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-500 text-sm text-center px-4">
            {selectedUser?.is_bot ? (
              <div>
                <p>Start a conversation with <strong>Meddy-GPT 🤖</strong></p>
                <p className="mt-1">Ask anything health-related or just say hi!</p>
              </div>
            ) : (
              <p>No messages yet. Say hi 👋</p>
            )}
          </div>
        )}

        {/* Show bot typing bubble */}
        {botTyping && selectedUser?.is_bot && (
        <div className="chat chat-start">
          <div className="chat-image avatar">
            <div className="size-10 rounded-full border ">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt="Bot"
              />
            </div>
          </div>
          <div className="chat-header mb-1">
            <time className="text-xs opacity-50 ml-1">typing...</time>
          </div>
          <div className="chat-bubble shadow-md flex items-center gap-2">
            <span className="animate-pulse">🤖 Meddy-GPT is typing...</span>
          </div>
        </div>
      )}

      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
