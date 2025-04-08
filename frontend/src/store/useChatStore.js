import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    lastMessageTimestamps: {},
    lastMessages: {},
    isContactLoading: null,
    ContactSelected: null,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/users");

            const lastMessagesData = {};
            const lastMessageTimestampsData = {};

            for (const user of res.data) {
                const messageRes = await axiosInstance.get(`/messages/${user._id}`);
                const lastMessage = messageRes.data.length ? messageRes.data[messageRes.data.length - 1] : null;

                lastMessagesData[user._id] = lastMessage;

                if (lastMessage?.createdAt) {
                    lastMessageTimestampsData[user._id] = new Date(lastMessage.createdAt).getTime();
                }
            }

            const sortedUsers = [...res.data].sort((a, b) => {
                const aTime = lastMessageTimestampsData[a._id] || 0;
                const bTime = lastMessageTimestampsData[b._id] || 0;
                return bTime - aTime;
            });

            set({
                users: sortedUsers,
                lastMessages: lastMessagesData,
                lastMessageTimestamps: lastMessageTimestampsData,
            });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch users");
        } finally {
            set({ isUsersLoading: false });
        }
    },



    // Fetch messages for selected user
    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({
                messages: res.data,
                lastMessages: {
                    ...get().lastMessages,
                    [userId]: res.data.length ? res.data[res.data.length - 1] : null, // Store last message
                },
            });


        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    // Send a new message
    sendMessage: async (messageData) => {
        const { selectedUser, messages, lastMessageTimestamps, lastMessages } = get();

        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            
            set({
                messages: [...messages, res.data],
                lastMessages: {
                    ...lastMessages,
                    [selectedUser._id]: res.data, // Update last sent message
                },
                lastMessageTimestamps: {
                    ...lastMessageTimestamps,
                    [selectedUser._id]: Date.now(),
                },
            });

        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    // Listen for new messages
    subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        
        try {
            socket.on("newMessage", (newMessage) => {
                set((state) => ({
                    messages:
                        state.selectedUser?._id === newMessage.senderId
                            ? [...state.messages, newMessage]  // Append message if chatting with sender
                            : state.messages,  // Keep existing messages otherwise
    
                    lastMessages: {
                        ...state.lastMessages,
                        [newMessage.senderId]: newMessage, // Store last received message
                    },
                    
                    lastMessageTimestamps: {
                        ...state.lastMessageTimestamps,
                        [newMessage.senderId]: Date.now(),
                    },
                }));
            });
            
        } catch (error) {
            toast.error(error.response.data.message);
            
        }   
    },

    // Unsubscribe when component unmounts
    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    // Select a user for chat
    setSelectedUser: (selectedUser) => set({ selectedUser }),
    setContactSelected: (ContactSelected) => set({ ContactSelected }),
    
    selectMeddyBotUser: async () => {
        const { users, getUsers, setSelectedUser } = get();
    
        if (users.length === 0) {
            await getUsers(); // Fetch users if not already loaded
        }
    
        // Search by is_bot flag (as string or boolean)
        const botUser = get().users.find((user) => user.is_bot === "true" || user.is_bot === true);
    
        if (botUser) {
            set({ selectedUser: botUser });
        } else {
            toast.error("Meddy-GPT bot not found");
        }
    },

}));
