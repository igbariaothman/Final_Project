import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import classes from "./Chat.module.css";
import { useUserContext } from "../../context/UserContext";

function Chat({ productId, sellerId, sellerName, isAdminChat, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef();
  const socketRef = useRef(null);

  const { currentUser } = useUserContext();

  useEffect(() => {
    if (!currentUser?.id || !sellerId || !productId) return;

    socketRef.current = io("http://localhost:5000");

    fetch(
      `http://localhost:5000/messages/history/${productId}/${currentUser.id}/${sellerId}`,
    )
      .then((res) => res.json())
      .then ((data) => {
        console.log("chat history" , data)
        if (Array.isArray(data)) {
          setMessages(data);
        }})

      .then((data) => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch((err) => console.error("Error fetching history:", err));

    socketRef.current.emit("join_chat", {
      userId: currentUser.id,
      sellerId,
      productId,
    });

    socketRef.current.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [currentUser?.id, sellerId, productId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // בדיקת נעילה - אם קיימת הודעת סגירה מסוג closed או הודעת הסרת מוצר
const isChatLocked = messages.some(
    (msg) =>
      msg.messageType === "closed" ||
      (msg.messageText && msg.messageText.includes("התלונה נסגרה על ידי המנהל")) ||
      (msg.messageText && msg.messageText.includes("הוסר מהמערכת"))
  );
  const sendMessage = () => {
    if (newMessage.trim() === "" || !currentUser?.id || isChatLocked) return;

    const messageData = {
      senderId: currentUser.id,
      receiverId: Number(sellerId),
      productId: Number(productId),
      messageText: newMessage.trim(),
      messageType: isAdminChat ? "admin_report" : "chat",
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, messageData]);
    setNewMessage("");

    if (socketRef.current) {
      socketRef.current.emit("send_message", messageData);
    }
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
        <button className={classes.closeBtn} onClick={onClose}>
          ✕
        </button>
        <h4>
          {isAdminChat
            ? `צ'אט מול המנהל בנושא מוצר #${productId}`
            : `צ'אט עם ${sellerName}`}
        </h4>
      </div>

      <div className={classes.messagesArea}>
        {messages.map((msg, index) => {
          const isOwnMessage = Number(msg.senderId) === Number(currentUser?.id);
          const isClosedType = msg.messageType === "closed";

          if (isClosedType) {
            return (
              <div key={index} className={classes.systemMessageRow}>
                <div className={classes.systemMessageBubble}>
                  🔒 {msg.messageText}
                </div>
              </div>
            );
          }

          return (
            <div
              key={index}
              className={`${classes.messageRow} ${
                isOwnMessage ? classes.ownMessage : classes.otherMessage
              }`}
            >
              <div className={classes.messageBubble}>
                <span className={classes.messageText}>{msg.messageText}</span>
                <span className={classes.messageTime}>
                  {formatTime(msg.created_at)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {isChatLocked ? (
        <div className={classes.lockedNotice}>
           פנייה זו נסגרה והמוצר הוסר. לא ניתן להשיב בצ'אט זה 🔒
        </div>
      ) : (
        <div className={classes.inputArea}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isAdminChat ? "כתוב הודעה למנהל..." : "הקלד הודעה..."}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button className={classes.sendButton} onClick={sendMessage}>
            שלח
          </button>
        </div>
      )}
    </div>
  );
}

export default Chat;
