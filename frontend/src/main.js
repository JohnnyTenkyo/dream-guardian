import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
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
function Protected({ children }) {
    const { token } = useAuth();
    if (!token)
        return _jsx(Navigate, { to: "/login", replace: true });
    return _jsx(_Fragment, { children: children });
}
function AdminOnly({ children }) {
    const { token, isAdmin } = useAuth();
    if (!token || !isAdmin)
        return _jsx(Navigate, { to: "/login", replace: true });
    return _jsx(_Fragment, { children: children });
}
ReactDOM.createRoot(document.getElementById("root")).render(_jsx(React.StrictMode, { children: _jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsxs(Route, { path: "/", element: _jsx(Protected, { children: _jsx(App, {}) }), children: [_jsx(Route, { index: true, element: _jsx(HomePage, {}) }), _jsx(Route, { path: "shop", element: _jsx(ShopPage, {}) }), _jsx(Route, { path: "inventory", element: _jsx(InventoryPage, {}) }), _jsx(Route, { path: "leaderboard", element: _jsx(LeaderboardPage, {}) }), _jsx(Route, { path: "records", element: _jsx(SleepRecordsPage, {}) }), _jsx(Route, { path: "period", element: _jsx(PeriodCalendarPage, {}) }), _jsx(Route, { path: "boss", element: _jsx(BossPage, {}) }), _jsx(Route, { path: "settings", element: _jsx(SettingsPage, {}) }), _jsx(Route, { path: "characters", element: _jsx(CharactersPage, {}) })] }), _jsx(Route, { path: "/admin", element: _jsx(AdminOnly, { children: _jsx(AdminPage, {}) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) }) }));
