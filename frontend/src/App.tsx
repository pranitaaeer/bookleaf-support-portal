
import { Navigate, Route, Routes } from "react-router-dom";

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

import "./styles/dashboard.scss";
import "./styles/portal-pages.scss";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/author/dashboard" element={<AuthorDashboard />} />
      <Route path="/author/books" element={<MyBooks />} />
      <Route path="/author/tickets/new" element={<CreateTicket />} />
      <Route path="/author/tickets" element={<MyTickets />} />
      <Route path="/author/tickets/:ticketId" element={<AuthorTicketDetails />} />

      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/tickets" element={<AdminTickets />} />
      <Route path="/admin/tickets/:ticketId" element={<AdminTicketDetails />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
