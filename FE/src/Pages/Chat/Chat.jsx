import { useState, useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
import classes from "./Chat.module.css";
import { useUserContext } from "../../context/UserContext";

function Chat({ productId, sellerId, sellerName, isAdminChat, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef();
  const socketRef = useRef(null);
  const { currentUser } = useUserContext();

  // גודל ומיקום החלון
  const [size, setSize] = useState({ width: 400, height: 580 });
  const [position, setPosition] = useState({
    x: Math.max(20, window.innerWidth - 440),
    y: Math.max(20, window.innerHeight - 620),
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  // התחלת גרירה מה-Header
  const handleDragMouseDown = (e) => {
    if (e.target.closest(`.${classes.closeBtn}`)) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  // התחלת שינוי גודל מימין למטה
  const handleResizeMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStart.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: size.width,
      startH: size.height,
    };
  };

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      const newX = Math.min(Math.max(10, e.clientX - dragStart.current.x), window.innerWidth - size.width - 10);
      const newY = Math.min(Math.max(10, e.clientY - dragStart.current.y), window.innerHeight - size.height - 10);
      setPosition({ x: newX, y: newY });
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.current.startX;
      const deltaY = e.clientY - resizeStart.current.startY;
      
      const newWidth = Math.min(Math.max(320, resizeStart.current.startW + deltaX), 800);
      const newHeight = Math.min(Math.max(380, resizeStart.current.startH + deltaY), window.innerHeight - 50);
      
      setSize({ width: newWidth, height: newHeight });
    }
  }, [isDragging, isResizing, size.width, size.height]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none";
    } else {
      document.body.style.userSelect = "auto";
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "auto";
    };
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (!currentUser?.id || !sellerId || !productId) return;

    socketRef.current = io("http://localhost:5000");

    fetch(
      `http://localhost:5000/messages/history/${productId}/${currentUser.id}/${sellerId}`
    )
      .then((res) => res.json())
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
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [currentUser?.id, sellerId, productId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    <div
      className={classes.chatContainer}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
    >
      <div className={classes.chatHeader} onMouseDown={handleDragMouseDown}>
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

      
      <div className={classes.resizeHandle} onMouseDown={handleResizeMouseDown}>
        <span>◢</span>
      </div>
    </div>
  );
}

export default Chat;