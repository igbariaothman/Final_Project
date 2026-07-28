import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";
import classes from "./adminPage.module.css";

function AdminPage() {
  const [reports, setReports] = useState([]);
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState("all");
  const { currentUser } = useUserContext();
  const [adminMessage, setAdminMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [searchProductId, setSearchProductId] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/reports")
      .then((res) => res.json())
      .then((data) => {
        setReports(data);
      })
      .catch((err) => {
        console.log("Error fetching reports:", err);
      });
  }, []);

  const getBadgeLabel = (type) => {
    if (type === "product") return "דיווח מוצר";
    if (type === "user") return "דיווח משתמש";
    if (type === "chat") return "דיווח צ'אט";
    return type;
  };

  async function deleteReport(reportId) {
    try {
      const res = await fetch(`http://localhost:5000/reports/${reportId}`, {
        method: "DELETE",
      });

      if (!res.ok) return;
      setReports((prev) => prev.filter((r) => r.reportId !== reportId));
    } catch (err) {
      console.log(err);
    }
  }

  async function deleteProductAndReport(reportId) {
    if (!reportId) return;
    try {
      const res = await fetch(
        `http://localhost:5000/reports/with-product/${reportId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            adminId: currentUser?.id,
            adminMessage: adminMessage,
          }),
        },
      );

      if (!res.ok) return;

      setReports((prev) => prev.filter((r) => r.reportId !== reportId));
      setAdminMessage("");
      setSelectedReportId(null);
    } catch (err) {
      console.log(err);
    }
  }

  const handleGoToProduct = async (e) => {
    e.preventDefault();
    const productId = searchProductId.trim();

    if (!productId) return;

    try {
      const res = await fetch(`http://localhost:5000/products/${productId}`);
      if (res.ok) {
        navigate(`/productDetails/${productId}`);
      } else {
        alert("המוצר אינו קיים במערכת");
      }
    } catch (err) {
      console.error("Error checking product existence:", err);
      alert("שגיאה בבדיקת נתוני המוצר");
    }
  };

  const filteredReports =
    filterType === "all"
      ? reports
      : reports.filter((report) => report.reportType === filterType);

  return (
    <div className={classes.adminContainer}>
      <h1 className={classes.adminTitle}>ניהול דיווחים</h1>

      <div className={classes.filterBar}>
        <form onSubmit={handleGoToProduct} className={classes.searchForm}>
          <input
            type="number"
            placeholder="הכנס מזהה מוצר"
            value={searchProductId}
            onChange={(e) => setSearchProductId(e.target.value)}
            className={classes.searchInput}
          />
          <button type="submit" className={classes.searchBtn}>
            עבור למוצר ➔
          </button>
        </form>

        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={classes.filterSelect}
          >
            <option value="all">כל הדיווחים במערכת</option>
            <option value="product">דיווח מוצר</option>
            <option value="user">דיווח משתמש</option>
            <option value="chat">דיווח צ'אט</option>
          </select>
        </div>
      </div>

      <div className={classes.reportsList}>
        {filteredReports.length === 0 ? (
          <div className={classes.emptyState}>
            <p className={classes.emptyStateText}>אין דיווחים קיימים במערכת</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div key={report.reportId} className={classes.reportCard}>
              <div
                className={classes.cardProductInfo}
                onClick={() => navigate(`/productDetails/${report.productId}`)}
              >
                <span className={classes.badgeProductId}>
                  מוצר #{report.productId}
                </span>
                <h3 className={classes.productName}>
                  {report.productName || "מוצר כללי"}
                </h3>
                <span className={classes.productPrice}>
                  {report.price
                    ? `₪${Number(report.price).toLocaleString()}`
                    : "חינם / תרומה"}
                </span>
              </div>

              <div
                className={classes.cardReporterInfo}
                onClick={() => navigate(`/productDetails/${report.productId}`)}
              >
                <span className={classes.badgeReportType}>
                  {getBadgeLabel(report.reportType)}
                </span>
                <p className={classes.reporterName}>
                  <strong>מדווח:</strong> {report.username || "משתמש"}
                </p>
              </div>

              <div className={classes.cardMessageBox}>
                <span className={classes.messageLabel}>תוכן הדיווח:</span>
                <p className={classes.messageText}>
                  {report.message || "ללא הודעה מפורטת"}
                </p>
              </div>

              <div className={classes.cardActions}>
                <span className={classes.reportIdLabel}>
                  דיווח #{report.reportId}
                </span>

                <button
                  type="button"
                  className={classes.btnDeleteProduct}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedReportId(report.reportId);
                    setAdminMessage(""); 
                    setShowModal(true);
                  }}
                >
                  מחיקת מוצר
                </button>

                <button
                  type="button"
                  className={classes.btnDeleteReport}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteReport(report.reportId);
                  }}
                >
                  מחיקת תלונה
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className={classes.modalOverlay}>
          <div className={classes.modalBox}>
            <h2 className={classes.modalTitle}>מחיקת מוצר וסגירת תלונה</h2>
            <textarea
              value={adminMessage}
              onChange={(e) => setAdminMessage(e.target.value)}
              placeholder="כתוב הודעה לבעל המוצר (סיבת המחיקה)..."
              className={classes.modalTextarea}
            />
            <div className={classes.modalActions}>
              <button
                type="button"
                className={classes.btnModalCancel}
                onClick={() => {
                  setShowModal(false);
                  setAdminMessage("");
                }}
              >
                ביטול
              </button>
              <button
                type="button"
                className={classes.btnModalConfirm}
                onClick={() => {
                  deleteProductAndReport(selectedReportId);
                  setShowModal(false);
                }}
              >
                אישור מחיקה
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
