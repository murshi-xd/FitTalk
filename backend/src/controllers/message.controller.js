import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import axios from "axios";

import dotenv from "dotenv";
dotenv.config();


export const getUsersForSidebar = async (req, res) => {
    // get user id, get user ids other than/ != current user for the side bar 
    try {
        const loggedInUserId = req.user._id
        const filteredUsers = await User.find({ _id: {$ne: loggedInUserId} }).select("-password")

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("Error in getUsersForSidebar controller", error.message)
        return res.status(500).json({ message: "Internal server error"});
    }
};


export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
  

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // Create and save the user's message
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // Emit message to receiver if online
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // ✅ Send response to sender once
    res.status(200).json(newMessage);

    // === Bot logic ===
    if (receiverId === process.env.BOT_USER_ID && text) {
      const userSocketId = getReceiverSocketId(senderId);

      // ⌛ Emit botTyping event BEFORE Flask call
      if (userSocketId) {
        io.to(userSocketId).emit("botTyping", {
          senderId: process.env.BOT_USER_ID,
        });
      }

      // 🧠 Call Flask API
      const flaskResponse = await axios.post(process.env.FLASK_API_URL, {
        message: text,
        user_id: senderId,
      });

      const botReply = flaskResponse.data.reply;

      // 📨 Save bot reply
      const botMessage = new Message({
        senderId: process.env.BOT_USER_ID,
        receiverId: senderId,
        text: botReply,
        is_bot: true,
      });

      await botMessage.save();

      // 📡 Emit bot reply
      if (userSocketId) {
        io.to(userSocketId).emit("newMessage", botMessage);
      }
    }

  } catch (error) {
    console.log("Error in sendMessage controller", error.message);

    // Only send response if not already sent
    if (!res.headersSent) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};
