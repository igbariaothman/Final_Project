
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Chat from "../Chat/Chat";
import classes from "./Inbox.module.css";
import { useUserContext } from "../../context/UserContext";

/**
 * מודול: תיבת דואר נכנס ושיחות
 * תפקיד: הצגת רשימת כל השיחות הפעילות של המשתמש, סימון הודעות שנקראו ופתיחת חלון צ'אט
 */

// חישוב מזהה איש הקשר בשיחה ביחס למשתמש הנוכחי
function getContactId(conv, currentUserId) {
  return Number(conv.senderId) === currentUserId ? Number(conv.receiverId) : Number(conv.senderId);
}

// משיכת רשימת השיחות של המשתמש מהשרת
function fetchUserInbox(userId, setConversations, setLoading) {
  fetch(`http://localhost:5000/messages/inbox/${userId}`)
    .then((res) => res.json())
    .then((data) => {
      setConversations(data);
      setLoading(false);
    })
    .catch((err) => {
      console.error(err);
      setLoading(false);
    });
}

// עדכון סטטוס ההודעות כנקראו בשרת
function markConversationAsRead(productId, currentUserId, contactId) {
  fetch("http://localhost:5000/messages/mark-read", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, userId: currentUserId, contactId }),
  }).catch(() => {});
}

function Inbox() {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { currentUser } = useUserContext();

  // בדיקת אימות וטעינת נתוני תיבת ההודעות
  useEffect(() => {
    if (!currentUser) return navigate("/login");
    fetchUserInbox(currentUser.id, setConversations, setLoading);
  }, [currentUser, navigate]);

  // פתיחת חלון השיחה וסימון ההודעות כנקראו
  const handleOpenChat = (conv) => {
    const contactId = getContactId(conv, currentUser.id);

    setConversations((prev) =>
      prev.map((c) => {
        const cContactId = getContactId(c, currentUser.id);
        return c.productId === conv.productId && cContactId === contactId ? { ...c, isRead: 1 } : c;
      })
    );

    markConversationAsRead(conv.productId, currentUser.id, contactId);
    setSelectedChat(conv);
  };

  // עיצוב תצוגת שעת קבלת ההודעה
  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
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
              const isUnread = conv.isRead === 0 && Number(conv.receiverId) === Number(currentUser.id);
              const isAdmin = conv.contactRole === "admin" || conv.isAdminChat;

              return (
                <div
                  key={index}
                  className={`${classes.conversationItem} ${isUnread ? classes.unread : ""} ${isAdmin ? classes.adminItem : ""}`}
                  onClick={() => handleOpenChat(conv)}
                >
                  <div className={`${classes.avatar} ${isAdmin ? classes.adminAvatar : ""} ${isUnread ? classes.unreadAvatar : ""}`}>
                    {isAdmin ? "🛡️" : conv.contactName?.charAt(0).toUpperCase() || "?"}
                  </div>

                  <div className={classes.convInfo}>
                    <div className={classes.convTop}>
                      <span className={classes.contactName}>{isAdmin ? "מנהל מערכת (Admin)" : conv.contactName}</span>
                      <span className={classes.convTime}>{formatTime(conv.created_at)}</span>
                    </div>

                    <div className={classes.convBottom}>
                      <span className={classes.productName}>🛍 {conv.productName || "מוצר כללי"}</span>
                      {isAdmin && <span className={classes.reportTag}>שיחה מול הנהלה</span>}
                      {isUnread && <span className={classes.newBadge}>חדש!</span>}
                    </div>

                    <p className={`${classes.lastMessage} ${isUnread ? classes.unreadMessageText : ""}`}>{conv.messageText}</p>
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
          sellerId={getContactId(selectedChat, currentUser.id)}
          sellerName={selectedChat.contactRole === "admin" || selectedChat.isAdminChat ? "מנהל מערכת (Admin)" : selectedChat.contactName}
          isAdminChat={selectedChat.contactRole === "admin" || selectedChat.isAdminChat}
          onClose={() => setSelectedChat(null)}
        />
      )}
    </div>
  );
}

export default Inbox;