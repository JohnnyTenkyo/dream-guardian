import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import App from "./App";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import InventoryPage from "./pages/InventoryPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import SleepRecordsPage from "./pages/SleepRecordsPage";
import PeriodCalendarPage from "./pages/PeriodCalendarPage";
import BossPage from "./pages/BossPage";
import SettingsPage from "./pages/SettingsPage";
import AdminPage from "./pages/AdminPage";
import CharactersPage from "./pages/CharactersPage";
import "./styles.css";
import { useAuth } from "./state/auth";

function Protected({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminOnly({ children }: { children: React.ReactNode }) {
  const { token, isAdmin } = useAuth();
  if (!token || !isAdmin) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <Protected>
              <App />
            </Protected>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="records" element={<SleepRecordsPage />} />
          <Route path="period" element={<PeriodCalendarPage />} />
          <Route path="boss" element={<BossPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="characters" element={<CharactersPage />} />
        </Route>
        <Route
          path="/admin"
          element={
            <AdminOnly>
              <AdminPage />
            </AdminOnly>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
