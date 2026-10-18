
import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import AuthorDashboard from "./pages/author/AuthorDashboard";
import MyBooks from "./pages/author/MyBooks";
import CreateTicket from "./pages/author/CreateTicket";
import MyTickets from "./pages/author/MyTickets";
import AuthorTicketDetails from "./pages/author/AuthorTicketDetails";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTickets from "./pages/admin/AdminTickets";
import AdminTicketDetails from "./pages/admin/AdminTicketDetails";

import ProtectedRoute from "./components/ProtectedRoute";

import "./styles/dashboard.scss";
import "./styles/portal-pages.scss";

export default function App() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Author protected routes */}
        <Route
          path="/author/dashboard"
          element={
            <ProtectedRoute allowedRole="author">
              <AuthorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/author/books"
          element={
            <ProtectedRoute allowedRole="author">
              <MyBooks />
            </ProtectedRoute>
          }
        />

        <Route
          path="/author/tickets/new"
          element={
            <ProtectedRoute allowedRole="author">
              <CreateTicket />
            </ProtectedRoute>
          }
        />

        <Route
          path="/author/tickets"
          element={
            <ProtectedRoute allowedRole="author">
              <MyTickets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/author/tickets/:ticketId"
          element={
            <ProtectedRoute allowedRole="author">
              <AuthorTicketDetails />
            </ProtectedRoute>
          }
        />

        {/* Admin protected routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/tickets"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminTickets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/tickets/:ticketId"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminTicketDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </>
  );
}
