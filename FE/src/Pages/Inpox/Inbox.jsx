import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Chat from "../Chat/Chat";
import classes from "./Inbox.module.css";
import { useUserContext } from "../../context/UserContext";

function Inbox() {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { currentUser } = useUserContext();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    fetch(`http://localhost:5000/messages/inbox/${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        setConversations(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching inbox:", err);
        setLoading(false);
      });
  }, [currentUser]);

  // Function to format the time for display in the inbox
  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Function to get the contact ID for a conversation, determining whether the current user is the sender or receiver
  const getContactId = (conv) => {
    return Number(conv.senderId) === currentUser.id
      ? Number(conv.receiverId)
      : Number(conv.senderId);
  };

  return (
    <div className={classes.inboxPage}>
      <div className={classes.inboxContainer}>
        <h2 className={classes.inboxTitle}>📬 תיבת הודעות</h2>

        {loading ? (
          <p className={classes.loading}>טוען...</p>
        ) : conversations.length === 0 ? (
          <p className={classes.empty}>אין הודעות עדיין</p>
        ) : (
          <div className={classes.conversationList}>
            {conversations.map((conv, index) => {
              const isUnread =
                conv.isRead === 0 && Number(conv.receiverId) === currentUser.id;

              return (
                <div
                  key={index}
                  className={`${classes.conversationItem} ${isUnread ? classes.unread : ""}`}
                  onClick={() => setSelectedChat(conv)}
                >
                  <div className={classes.avatar}>
                    {conv.contactRole === "admin"
                      ? "מנהל"
                      : conv.contactName?.charAt(0).toUpperCase() || "?"}
                  </div>

                  <div className={classes.convInfo}>
                    <div className={classes.convTop}>
                      <span className={classes.contactName}>
                        {conv.contactRole === "admin"
                          ? "מנהל מערכת (Admin)"
                          : conv.contactName}
                      </span>
                      <span className={classes.convTime}>
                        {formatTime(conv.created_at)}
                      </span>
                    </div>
                    <div className={classes.convBottom}>
                      <span className={classes.productName}>
                        🛍 {conv.productName}
                      </span>
                      {isUnread && <span className={classes.unreadDot} />}
                    </div>
                    <p className={classes.lastMessage}>{conv.messageText}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedChat && (
        <Chat
          productId={selectedChat.productId}
          sellerId={getContactId(selectedChat)}
          sellerName={
            selectedChat.contactRole === "admin"
              ? "מנהל מערכת (Admin)"
              : selectedChat.contactName
          }
          isAdminChat={selectedChat.contactRole === "admin"}
          onClose={() => setSelectedChat(null)}
        />
      )}
    </div>
  );
}

export default Inbox;
