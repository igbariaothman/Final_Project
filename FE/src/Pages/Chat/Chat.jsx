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
    //dont connect to socket if any of the required parameters are missing
    if (!currentUser?.id || !sellerId || !productId) return;
    //make a connection to the socket server
    socketRef.current = io("http://localhost:5000");

    //get the chat history between the current user and the seller for the specific product and save it to the messages state 
    fetch(
      `http://localhost:5000/messages/history/${productId}/${currentUser.id}/${sellerId}`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch((err) => console.error("Error fetching history:", err));

  //Join the chat room for the specific product and users
    socketRef.current.emit("join_chat", {
      userId: currentUser.id,
      sellerId,
      productId,
    });

    //show if coming new message from the server do validation and add it to the messages state if it is for the current product and not sent by the current user
    socketRef.current.on("receive_message", (data) => {
      if (
        Number(data.productId) === Number(productId) &&
        Number(data.senderId) !== Number(currentUser.id)
      ) {
        setMessages((prev) => [...prev, data]);
      }
    });

    //disconnect from the socket server when close the chat or when the component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      } 
    };
  }, [currentUser?.id, sellerId, productId]);

  // Scroll to the bottom of the chat when new messages are added
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  //func dosn't send empty messages or if the current user is not defined
  const sendMessage = () => {
    if (newMessage.trim() === "" || !currentUser?.id) return;

    // Create a message object with the necessary details
    const messageData = {
      senderId: currentUser.id,
      receiverId: Number(sellerId),
      productId: Number(productId),
      messageText: newMessage.trim(),
      messageType: "chat",
      created_at: new Date().toISOString(),
    };
    // Add the new message to the messages state and clear the input field
    setMessages((prev) => [...prev, messageData]);
    setNewMessage("");
    // Emit the message to the server via the socket connection
    if (socketRef.current) {
      socketRef.current.emit("send_message", messageData);
    }
  };
  
  // Function to format the time for display in the chat
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
        <h4>צ'אט עם {sellerName}</h4>
      </div>

      <div className={classes.messagesArea}>
        {messages.map((msg, index) => {
          const isOwnMessage = Number(msg.senderId) === Number(currentUser?.id);
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

      {!isAdminChat && (
        <div className={classes.inputArea}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="הקלד הודעה..."
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
