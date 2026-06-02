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

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
                    {conv.contactName?.charAt(0).toUpperCase() || "?"}
                  </div>

                  <div className={classes.convInfo}>
                    <div className={classes.convTop}>
                      <span className={classes.contactName}>
                        {conv.contactName}
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
          sellerName={selectedChat.contactName}
          onClose={() => setSelectedChat(null)}
        />
      )}
    </div>
  );
}

export default Inbox;
