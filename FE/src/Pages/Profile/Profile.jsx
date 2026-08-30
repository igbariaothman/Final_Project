/**
 * מודול: מסך פרופיל והגדרות משתמש
 * תפקיד: צפייה בפרטי החשבון, עדכון שם משתמש, העלאת תמונת פרופיל ושינוי סיסמה
 */

import { useState, useRef } from "react";
import { useUserContext } from "../../context/UserContext";
import classes from "./Profile.module.css";

function Profile() {
  const { currentUser, updateProfileData } = useUserContext();

  // עריכת פרופיל (שם ותמונה)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [usernameInput, setUsernameInput] = useState(currentUser?.username || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(
    currentUser?.profileImage ? `http://localhost:5000${currentUser.profileImage}` : null
  );
  const fileInputRef = useRef(null);

  // עריכת סיסמה
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // הודעות סטטוס וחיווי למשתמש
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // טיפול בבחירת קובץ תמונה מקומי ויצירת תצוגה מקדימה
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // שמירת עדכוני הפרופיל (שם משתמש ותמונה) בשרת
  const handleSaveProfile = async () => {
    setMessage("");
    const formData = new FormData();
    formData.append("username", usernameInput);
    if (selectedFile) {
      formData.append("profileImage", selectedFile);
    }

    try {
      const res = await fetch(`http://localhost:5000/users/update-profile/${currentUser.id}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "שגיאה בעדכון הפרופיל");
        setMessageType("error");
        return;
      }

      setMessage("הפרופיל עודכן בהצלחה! ✅");
      setMessageType("success");
      if (updateProfileData) updateProfileData(data.user);
      setIsEditingProfile(false);
    } catch (err) {
      setMessage("שגיאה בחיבור לשרת");
      setMessageType("error");
    }
  };

  // אימות ושליחת בקשת שינוי סיסמה לשרת
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
          body: JSON.stringify({ currentPassword, newPassword }),
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
        {/* אזור תמונת פרופיל ושם משתמש */}
        <div className={classes.avatarSection}>
          <div
            className={classes.avatarWrapper}
            onClick={() => isEditingProfile && fileInputRef.current.click()}
          >
            {previewImage || currentUser?.profileImage ? (
              <img
                src={previewImage || `http://localhost:5000${currentUser?.profileImage}`}
                alt="Profile"
                className={classes.avatarImg}
              />
            ) : (
              <div className={classes.avatar}>
                {currentUser?.username?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            {isEditingProfile && <div className={classes.avatarOverlay}>📷 שנה תמונה</div>}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            style={{ display: "none" }}
          />

          <h2 className={classes.username}>{currentUser?.username}</h2>
          <span className={classes.roleBadge}>
            {currentUser?.role === "admin" ? "מנהל מערכת" : "משתמש"}
          </span>
        </div>

        {/* הודעות סטטוס והתראות */}
        {message && (
          <p className={messageType === "success" ? classes.successMsg : classes.errorMsg}>
            {message}
          </p>
        )}

        {/* טופס עריכת פרטי פרופיל או הצגתם במצב קריאה */}
        {isEditingProfile ? (
          <div className={classes.passwordForm}>
            <h3 className={classes.passwordTitle}>עריכת פרטי פרופיל</h3>
            <div className={classes.inputGroup}>
              <label>שם משתמש חדש (שינוי מתאפשר פעם ב-14 יום):</label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="הכנס שם משתמש"
              />
            </div>
            <div className={classes.btnRow}>
              <button className={classes.saveBtn} onClick={handleSaveProfile}>
                שמור פרטים
              </button>
              <button
                className={classes.cancelBtn}
                onClick={() => {
                  setIsEditingProfile(false);
                  setMessage("");
                }}
              >
                ביטול
              </button>
            </div>
          </div>
        ) : (
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
        )}

        {/* כפתורי מעבר למצבי עריכה */}
        <div className={classes.actionButtonsRow}>
          {!isEditingProfile && !isEditingPassword && (
            <button
              className={classes.editBtn}
              onClick={() => {
                setIsEditingProfile(true);
                setMessage("");
              }}
            >
              עריכת פרופיל ותמונה ✏️
            </button>
          )}

          {!isEditingPassword && !isEditingProfile && (
            <button
              className={classes.editBtn}
              onClick={() => {
                setIsEditingPassword(true);
                setMessage("");
              }}
            >
              שינוי סיסמה 🔒
            </button>
          )}
        </div>

        {/* טופס שינוי סיסמה */}
        {isEditingPassword && (
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
                placeholder="הכנס סיסמה חדשה (מינימום 8 תווים)"
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
            <div className={classes.btnRow}>
              <button className={classes.saveBtn} onClick={handleChangePassword}>
                שמור סיסמה
              </button>
              <button
                className={classes.cancelBtn}
                onClick={() => {
                  setIsEditingPassword(false);
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
  );
}

export default Profile;