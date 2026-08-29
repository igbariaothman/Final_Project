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
  }, [currentUser, navigate]);

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

  const handleOpenChat = (conv) => {
    const contactId = getContactId(conv);

    // עדכון מיידי בממשק ללא צורך בריענון
    setConversations((prev) =>
      prev.map((c) => {
        const cContactId = getContactId(c);
        if (c.productId === conv.productId && cContactId === contactId) {
          return { ...c, isRead: 1 };
        }
        return c;
      })
    );

    // עדכון בשרת
    fetch(`http://localhost:5000/messages/mark-read`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: conv.productId,
        userId: currentUser.id,
        contactId: contactId,
      }),
    }).catch(() => {});

    setSelectedChat(conv);
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
                conv.isRead === 0 && Number(conv.receiverId) === Number(currentUser.id);
              const isAdmin = conv.contactRole === "admin" || conv.isAdminChat;

              return (
                <div
                  key={index}
                  className={`${classes.conversationItem} ${
                    isUnread ? classes.unread : ""
                  } ${isAdmin ? classes.adminItem : ""}`}
                  onClick={() => handleOpenChat(conv)}
                >
                  <div
                    className={`${classes.avatar} ${
                      isAdmin ? classes.adminAvatar : ""
                    } ${isUnread ? classes.unreadAvatar : ""}`}
                  >
                    {isAdmin
                      ? "🛡️"
                      : conv.contactName?.charAt(0).toUpperCase() || "?"}
                  </div>

                  <div className={classes.convInfo}>
                    <div className={classes.convTop}>
                      <span className={classes.contactName}>
                        {isAdmin ? "מנהל מערכת (Admin)" : conv.contactName}
                      </span>
                      <span className={classes.convTime}>
                        {formatTime(conv.created_at)}
                      </span>
                    </div>

                    <div className={classes.convBottom}>
                      <span className={classes.productName}>
                        🛍 {conv.productName || "מוצר כללי"}
                      </span>
                      {isAdmin && (
                        <span className={classes.reportTag}>
                          שיחה מול הנהלה
                        </span>
                      )}
                      {isUnread && (
                        <span className={classes.newBadge}>חדש!</span>
                      )}
                      {isUnread && <span className={classes.unreadDot} />}
                    </div>

                    <p
                      className={`${classes.lastMessage} ${
                        isUnread ? classes.unreadMessageText : ""
                      }`}
                    >
                      {conv.messageText}
                    </p>
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
            selectedChat.contactRole === "admin" || selectedChat.isAdminChat
              ? "מנהל מערכת (Admin)"
              : selectedChat.contactName
          }
          isAdminChat={
            selectedChat.contactRole === "admin" || selectedChat.isAdminChat
          }
          onClose={() => setSelectedChat(null)}
        />
      )}
    </div>
  );
}

export default Inbox;