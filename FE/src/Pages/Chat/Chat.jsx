import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import classes from "./Chat.module.css";
import { useUserContext } from "../../context/UserContext";

function Chat({ productId, sellerId, sellerName, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef();
  const socketRef = useRef(null);

  const { currentUser } = useUserContext();
  const userId = Number(currentUser?.id);

  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    if (userId && sellerId && productId) {
      fetch(`http://localhost:5000/messages/history/${productId}/${userId}/${sellerId}`)
        .then((res) => res.json())
        .then((data) => setMessages(data))
        .catch((err) => console.error("Error fetching history:", err));

      socketRef.current.emit("join_chat", { userId, sellerId, productId });

      socketRef.current.on("receive_message", (data) => {
        if (Number(data.senderId) !== userId) {
          setMessages((prev) => [...prev, data]);
        }
      });
    }

    return () => {
      socketRef.current.disconnect();
    };
  }, [userId, sellerId, productId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim() === "") return;

    const messageData = {
      senderId: userId,
      receiverId: Number(sellerId),
      productId: Number(productId),
      messageText: newMessage,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, messageData]);
    setNewMessage("");
    socketRef.current.emit("send_message", messageData);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={classes.chatContainer}>
      <div className={classes.chatHeader}>
        <button className={classes.closeBtn} onClick={onClose}>✕</button>
        <h4>צ"ט עם {sellerName}</h4>
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
                <span className={classes.messageText}>{msg.messageText}</span>
                <span className={classes.messageTime} >
                  {formatTime(msg.created_at)}
                </span>
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
    placeholder="הקלד הודעה..."
    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
  />

  <button
    className={classes.sendButton}
    onClick={sendMessage}
  >
    שלח
  </button>
</div>
    </div>
  );
}

export default Chat;