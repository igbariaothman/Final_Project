import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import classes from "./AdminStats.module.css";

const ALL_CATEGORIES = [
  "אלקטרוניקה ומחשוב",
  "ספרים וחומרי לימוד",
  "ריהוט וציוד לחדר",
  "מוצרי חשמל למעונות",
  "תיקים ואביזרים",
  "כלי כתיבה וציוד משרדי",
  "ציוד מעבדה",
  "אחר",
];

const CATEGORY_COLORS = [
  "#00f2fe",
  "#a855f7",
  "#00ffaa",
  "#f4a836",
  "#ff4b2b",
  "#3b82f6",
  "#ec4899",
  "#64748b",
];

const PIE_COLORS = ["#00f2fe", "#a855f7"];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className={classes.customTooltip}>
        <p className={classes.tooltipTitle}>{data.name}</p>

        <p className={classes.tooltipCount}>
          כמות מוצרים: <strong>{data.count}</strong>
        </p>
      </div>
    );
  }

  return null;
};

const CustomXAxisTick = ({ x, y, payload }) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={12}
        textAnchor="end"
        fill="#cbd5e1"
        fontSize={11}
        transform="rotate(-25)"
      >
        {payload.value}
      </text>
    </g>
  );
};

function AdminStats() {
  // All products from database
  const [products, setProducts] = useState([]);

  // Reports stay exactly as they are
  const [reports, setReports] = useState([]);

  // Selected time filter
  const [timeFilter, setTimeFilter] = useState("all");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalReports: 0,
    totalDonations: 0,
    totalMarketValue: 0,
    categoryData: [],
    typeData: [],
    timelineData: [],
  });

  const [loading, setLoading] = useState(true);

  // =========================================================
  // Get products and reports ONCE
  // =========================================================
  useEffect(() => {
    Promise.all([
      fetch("http://localhost:5000/products").then((res) => res.json()),
      fetch("http://localhost:5000/reports").then((res) => res.json()),
    ])
      .then(([productsData, reportsData]) => {
        setProducts(productsData);
        setReports(reportsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading stats:", err);
        setLoading(false);
      });
  }, []);

  // =========================================================
  // Get start date according to selected filter
  // =========================================================
  const getStartDate = () => {
    const now = new Date();
    const startDate = new Date(now);

    if (timeFilter === "week") {
      startDate.setDate(now.getDate() - 7);
    }

    if (timeFilter === "month") {
      startDate.setMonth(now.getMonth() - 1);
    }

    if (timeFilter === "3months") {
      startDate.setMonth(now.getMonth() - 3);
    }

    return startDate;
  };

  // =========================================================
  // Calculate statistics whenever filter changes
  // =========================================================
useEffect(() => {
  if (loading) return;

  let filteredProducts = products;

  // =========================================================
  // Filter products by selected time
  // =========================================================

  if (timeFilter !== "all") {
    const now = new Date();
    let startDateFilter = new Date();

    // Last 7 days
    if (timeFilter === "week") {
      startDateFilter.setDate(now.getDate() - 7);
    }

    // Last month
    if (timeFilter === "month") {
      startDateFilter.setMonth(now.getMonth() - 1);
    }

    // Last 3 months
    if (timeFilter === "3months") {
      startDateFilter.setMonth(now.getMonth() - 3);
    }

    // =======================================================
    // Custom date range
    // =======================================================

    if (timeFilter === "custom") {
      // If no dates selected, don't filter
      if (!startDate && !endDate) {
        filteredProducts = products;
      } else {
        filteredProducts = products.filter((product) => {
          if (!product.created_at) {
            return false;
          }

          const productDate = new Date(product.created_at);

          // From date
          if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);

            if (productDate < start) {
              return false;
            }
          }

          // To date
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            if (productDate > end) {
              return false;
            }
          }

          return true;
        });
      }
    } else {
      // =====================================================
      // Normal filters: week / month / 3 months
      // =====================================================

      filteredProducts = products.filter((product) => {
        if (!product.created_at) {
          return false;
        }

        const productDate = new Date(product.created_at);

        return productDate >= startDateFilter && productDate <= now;
      });
    }
  }

  // =========================================================
  // Category counts
  // =========================================================

  const categoryCounts = {};

  ALL_CATEGORIES.forEach((cat) => {
    categoryCounts[cat] = 0;
  });

  let saleCount = 0;
  let donationCount = 0;
  let marketValueSum = 0;

  const monthlyMap = {};

  // =========================================================
  // Calculate using filtered products
  // =========================================================

  filteredProducts.forEach((p) => {
    const cat = p.category || "אחר";

    if (categoryCounts[cat] !== undefined) {
      categoryCounts[cat]++;
    } else {
      categoryCounts["אחר"]++;
    }

    // =======================================================
    // Sale / Donation
    // =======================================================

    if (p.listingType === "donation" || Number(p.price) === 0) {
      donationCount++;
    } else {
      saleCount++;

      // Only available products
      const isAvailable = !p.status || p.status === "available";

      if (isAvailable) {
        marketValueSum += Number(p.price) || 0;
      }
    }

    // =======================================================
    // Timeline
    // =======================================================

    if (p.created_at) {
      const date = new Date(p.created_at);

      if (!isNaN(date.getTime())) {
        const yearMonthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1,
        ).padStart(2, "0")}`;

        const displayMonth = date.toLocaleDateString("he-IL", {
          month: "long",
          year: "numeric",
        });

        if (!monthlyMap[yearMonthKey]) {
          monthlyMap[yearMonthKey] = {
            time: displayMonth,
            products: 0,
          };
        }

        monthlyMap[yearMonthKey].products += 1;
      }
    }
  });

  // =========================================================
  // Category data
  // =========================================================

  const categoryData = ALL_CATEGORIES.map((cat) => ({
    name: cat,
    count: categoryCounts[cat],
  }));

  // =========================================================
  // Sale / Donation data
  // =========================================================

  const typeData = [
    {
      name: "למכירה",
      value: saleCount,
    },
    {
      name: "לתרומה/חינם",
      value: donationCount,
    },
  ];

  // =========================================================
  // Timeline data
  // =========================================================

  const timelineData = Object.keys(monthlyMap)
    .sort()
    .map((key) => monthlyMap[key]);

  // =========================================================
  // Update stats
  // =========================================================

  setStats({
    totalProducts: filteredProducts.length,

    // Reports are NOT filtered
    totalReports: reports.length,

    totalDonations: donationCount,

    totalMarketValue: marketValueSum,

    categoryData,

    typeData,

    timelineData,
  });
}, [products, reports, timeFilter, startDate, endDate, loading]);

  // =========================================================
  // Loading
  // =========================================================

  if (loading) {
    return <p className={classes.loading}>טוען נתונים סטטיסטיים...</p>;
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className={classes.statsContainer}>
      {/* =====================================================
          TIME FILTER
      ====================================================== */}

      <div className={classes.filterContainer}>
        <label htmlFor="timeFilter">הצג נתוני מוצרים עבור:</label>

        <select
          id="timeFilter"
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
        >
          <option value="all">כל הזמן</option>

          <option value="week">השבוע האחרון</option>

          <option value="month">החודש האחרון</option>

          <option value="3months">3 חודשים אחרונים</option>

          <option value="custom">טווח מותאם</option>
        </select>

        {timeFilter === "custom" && (
          <div className={classes.customDateRange}>
            <div>
              <label>מתאריך:</label>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label>עד תאריך:</label>

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <div className={classes.kpiGrid}>
        <div className={`${classes.kpiCard} ${classes.kpiCyan}`}>
          <div className={classes.kpiHeader}>
            <span className={classes.kpiLabel}>מוצרים במערכת</span>

            <span className={classes.kpiIcon}>📦</span>
          </div>

          <span className={classes.kpiValue}>{stats.totalProducts}</span>
        </div>

        <div className={`${classes.kpiCard} ${classes.kpiOrange}`}>
          <div className={classes.kpiHeader}>
            <span className={classes.kpiLabel}>דיווחים פתוחים</span>

            <span className={classes.kpiIcon}>⚠️</span>
          </div>

          <span className={classes.kpiValue}>{stats.totalReports}</span>
        </div>

        <div className={`${classes.kpiCard} ${classes.kpiPurple}`}>
          <div className={classes.kpiHeader}>
            <span className={classes.kpiLabel}>מודעות תרומה</span>

            <span className={classes.kpiIcon}>🎁</span>
          </div>

          <span className={classes.kpiValue}>{stats.totalDonations}</span>
        </div>

        <div className={`${classes.kpiCard} ${classes.kpiGreen}`}>
          <div className={classes.kpiHeader}>
            <span className={classes.kpiLabel}>ערך מודעות פעילות</span>

            <span className={classes.kpiIcon}>💎</span>
          </div>

          <span className={classes.kpiValue}>
            ₪{stats.totalMarketValue.toLocaleString()}
          </span>
        </div>
      </div>

      {/* =====================================================
          CHARTS
      ====================================================== */}

      <div className={classes.chartsGrid}>
        {/* ================= CATEGORY ================= */}

        <div className={classes.chartCard}>
          <h3 className={classes.chartTitle}>📊 התפלגות מוצרים לפי קטגוריה</h3>

          <ResponsiveContainer width="100%" height={340}>
            <BarChart
              data={stats.categoryData}
              margin={{
                bottom: 65,
                top: 10,
              }}
            >
              <XAxis dataKey="name" interval={0} tick={<CustomXAxisTick />} />

              <YAxis stroke="#94a3b8" allowDecimals={false} />

              <Tooltip content={<CustomTooltip />} />

              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {stats.categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ================= PIE ================= */}

        <div className={classes.chartCard}>
          <h3 className={classes.chartTitle}>
            🥧 סוגי מודעות (מכירה vs תרומה)
          </h3>

          <ResponsiveContainer width="100%" height={340}>
            <PieChart>
              <Pie
                data={stats.typeData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={6}
                label
              >
                {stats.typeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />

              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* ================= TIMELINE ================= */}

        <div className={`${classes.chartCard} ${classes.fullWidthChart}`}>
          <h3 className={classes.chartTitle}>📈 קצב פרסום מוצרים לפי חודשים</h3>

          <ResponsiveContainer width="100%" height={280}>
            {stats.timelineData.length > 0 ? (
              <AreaChart data={stats.timelineData}>
                <defs>
                  <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.8} />

                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1} />
                  </linearGradient>
                </defs>

                <XAxis dataKey="time" stroke="#94a3b8" />

                <YAxis stroke="#94a3b8" allowDecimals={false} />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="products"
                  stroke="#00f2fe"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorArea)"
                />
              </AreaChart>
            ) : (
              <p className={classes.emptyText}>
                אין עדיין תאריכי פרסום מוצרים במערכת
              </p>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default AdminStats;
