import { useState } from "react";
import { useUserContext } from "../../context/UserContext";
import classes from "./Profile.module.css";

function Profile() {
  const { currentUser } = useUserContext();

  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

 const handleChangePassword = async () => {
  setMessage("");

  if (!currentPassword || !newPassword || !confirmPassword) {
    setMessage("נא למלא את כל השדות");
    setMessageType("error");
    return;
  }

  if (newPassword !== confirmPassword) {
    setMessage("הסיסמאות החדשות אינן תואמות");
    setMessageType("error");
    return;
  }

  if (newPassword.length < 8) {
    setMessage("הסיסמה חייבת להכיל לפחות 8 תווים");
    setMessageType("error");
    return;
  }

  try {
    const res = await fetch(
      `http://localhost:5000/users/change-password/${currentUser.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || "שגיאה בעדכון הסיסמה");
      setMessageType("error");
      return;
    }

    setMessage("הסיסמה עודכנה בהצלחה! ✅");
    setMessageType("success");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsEditingPassword(false);
  } catch (err) {
    setMessage("שגיאה בחיבור לשרת");
    setMessageType("error");
  }
};

  return (
    <div className={classes.profilePage}>
      <div className={classes.profileCard}>

        {/* Avatar */}
        <div className={classes.avatarSection}>
          <div className={classes.avatar}>
            {currentUser?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <h2 className={classes.username}>{currentUser?.username}</h2>
          <span className={classes.roleBadge}>
            {currentUser?.role === "admin" ? "מנהל" : "משתמש"}
          </span>
        </div>

        {/* Info */}
        <div className={classes.infoSection}>
          <div className={classes.infoItem}>
            <span className={classes.infoLabel}>שם משתמש</span>
            <span className={classes.infoValue}>{currentUser?.username}</span>
          </div>
          <div className={classes.infoItem}>
            <span className={classes.infoLabel}>אימייל</span>
            <span className={classes.infoValue}>{currentUser?.email}</span>
          </div>
          <div className={classes.infoItem}>
            <span className={classes.infoLabel}>תפקיד</span>
            <span className={classes.infoValue}>
              {currentUser?.role === "admin" ? "מנהל מערכת" : "משתמש רגיל"}
            </span>
          </div>
        </div>

        {/* Password Section */}
        <div className={classes.passwordSection}>
          {!isEditingPassword ? (
            <button
              className={classes.editBtn}
              onClick={() => setIsEditingPassword(true)}
            >
              🔒 שינוי סיסמה
            </button>
          ) : (
            <div className={classes.passwordForm}>
              <h3 className={classes.passwordTitle}>שינוי סיסמה</h3>

              <div className={classes.inputGroup}>
                <label>סיסמה נוכחית</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="הכנס סיסמה נוכחית"
                />
              </div>

              <div className={classes.inputGroup}>
                <label>סיסמה חדשה</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="הכנס סיסמה חדשה"
                />
              </div>

              <div className={classes.inputGroup}>
                <label>אימות סיסמה חדשה</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="אמת סיסמה חדשה"
                />
              </div>

              {message && (
                <p className={messageType === "success" ? classes.successMsg : classes.errorMsg}>
                  {message}
                </p>
              )}

              <div className={classes.btnRow}>
                <button className={classes.saveBtn} onClick={handleChangePassword}>
                  שמור
                </button>
                <button
                  className={classes.cancelBtn}
                  onClick={() => {
                    setIsEditingPassword(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setMessage("");
                  }}
                >
                  ביטול
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;