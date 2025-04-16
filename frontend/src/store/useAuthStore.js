// global state store using zustand
// golab states, global functions, api calls


import {create} from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import {io} from "socket.io-client"


const BASE_URL = import.meta.env.MODE === "development" ? "https://api.auth.localhost" : "/" ;

export const useAuthStore = create((set,get)=> ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    onlineUsers: [],
    socket:null,


    isCheckingAuth: true,


    checkAuth: async() =>{
        try {
            const res = await axiosInstance.get("/auth/check");
            
            set({authUser:res.data})

        
            get().connectSocket()
        } catch (error) {
            set({authUser:null})
            return console.log("Error in checkAuth:", error);
            
        }finally{
            set({isCheckingAuth:false})
        }
    },


    signup: async(data) => {
        set({isSigningUp : true})
        try {
            const res = await axiosInstance.post("auth/signup", data)
            set({ authUser : res.data })
            toast.success("Account created successfully")

            get().connectSocket()

        } catch (error) {
            toast.error(error.response.data.message);
        }finally{
            set({isSigningUp : false})
        }
    },

    logout: async() => {
        try {
            await axiosInstance.post("auth/logout");
            set({authUser: null})
            toast.success("Logged out successfully")

            get().disconnectSocket()
        } catch (error) {
            toast.error("error.response.data.message")
            
        }
    },
    
    login: async(data) => {
        set({isLoggingIn : true})
        try {
            const res = await axiosInstance.post("auth/login", data)
            set({ authUser : res.data })
            toast.success("Logged in successfully")

            get().connectSocket()

        } catch (error) {
            toast.error(error.response.data.message);
        }finally{
            set({isLoggingIn : false})
        }
    },

    updateProfile : async(data) => {
        set({isUpdatingProfile : true}) 
        try {
            const res = await axiosInstance.put("auth/update-profile", data)
            set({ authUser : res.data })
            toast.success("Profile updated successfully")
        } catch (error) {
            console.log("error in update profile:", error)
            toast.error(error.response.data.message);

        }finally{
            set({isUpdatingProfile : false})
        }
        
    },

    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;
    
        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id,
            },
        });
    
        // The socket is automatically connected when io() is called, so no need to call socket.connect() here.
    
        set({ socket });
    
        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        });
    },
    
    disconnectSocket: () => {
        const { socket } = get();
        if (socket?.connected) {
            socket.disconnect();
            set({ socket: null }); // Optionally clear the socket from the state after disconnecting
        }
    },


}))