import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import classes from "./Chat.module.css";

const socket = io("http://localhost:5000");

function Chat({ productId, sellerId, sellerName }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef();
  
  const userId = Number(localStorage.getItem("id"));

  useEffect(() => {
    if (userId && sellerId && productId) {
      // جلب السجل التاريخي
      fetch(`http://localhost:5000/messages/history/${productId}/${userId}/${sellerId}`)
        .then((res) => res.json())
        .then((data) => setMessages(data))
        .catch((err) => console.error("Error fetching history:", err));

      socket.emit("join_chat", { userId, sellerId, productId });

      socket.on("receive_message", (data) => {
        setMessages((prev) => [...prev, data]);
      });
    }

    return () => {
      socket.off("receive_message");
    };
  }, [userId, sellerId, productId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (newMessage.trim() === "") return;

    const messageData = {
      senderId: userId,
      receiverId: Number(sellerId),
      productId: Number(productId),
      messageText: newMessage
    };

    socket.emit("send_message", messageData); //
    setNewMessage("");
  };

  return (
    <div className={classes.chatContainer}>
      <div className={classes.chatHeader}>
        <h4>Chat with {sellerName}</h4>
      </div>
      <div className={classes.messagesArea}>
        {messages.map((msg, index) => {
          const isOwnMessage = Number(msg.senderId) === userId;
          
          return (
            <div 
              key={index} 
              className={`${classes.messageRow} ${isOwnMessage ? classes.ownMessage : classes.otherMessage}`}
            >
              <div className={classes.messageBubble}>
                {msg.messageText} 
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>
      <div className={classes.inputArea}>
        <input 
          type="text" 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)} 
          placeholder="Type your message..."
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;