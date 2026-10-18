
import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  CircleCheck,
  Clock3,
  AlertTriangle,
  Ticket as TicketIcon,
} from "lucide-react";
import api from "../../services/api";

type Priority = "Critical" | "High" | "Medium" | "Low";

type TicketItem = {
  _id: string;
  subject: string;
  category: string;
  priority: Priority;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  createdAt: string;
  author?: { name?: string; email?: string };
};

type ApiResponse = {
  success: boolean;
  count: number;
  data: TicketItem[];
  message?: string;
};

type StatTone = "green" | "blue" | "red" | "purple";

type Stat = {
  label: string;
  value: string;
  sub: string;
  icon: typeof TicketIcon;
  progress: number;
  tone: StatTone;
  caption: string;
};

const priorityClass: Record<Priority, string> = {
  Critical: "priority-badge priority-badge--high",
  High: "priority-badge priority-badge--high",
  Medium: "priority-badge priority-badge--medium",
  Low: "priority-badge priority-badge--low",
};

const progressStyle = (progress: number): CSSProperties =>
  ({ "--progress": `${progress}%` }) as CSSProperties;

function ticketAge(date: string) {
  const elapsed = Math.max(0, Date.now() - new Date(date).getTime());
  const hours = Math.floor(elapsed / 3_600_000);

  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}


export default function AdminDashboard() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const response = await api.get<ApiResponse>("/admin/tickets");

        if (active) {
          setTickets(response.data.data ?? []);
          setError("");
        }
      } catch (err: unknown) {
        if (!active) return;

        const apiError = err as {
          response?: { data?: { message?: string } };
        };

        setError(
          apiError.response?.data?.message ??
            "Unable to load admin dashboard data."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDashboard();

    // Refresh ticket counts and urgent tickets periodically.
    const interval = window.setInterval(loadDashboard, 30_000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const openCount = tickets.filter((t) => t.status === "Open").length;
  const inProgressCount = tickets.filter(
    (t) => t.status === "In Progress"
  ).length;
  const criticalHighCount = tickets.filter(
    (t) => t.priority === "Critical" || t.priority === "High"
  ).length;

  // const today = new Date();
  // const resolvedTodayCount = tickets.filter((t) => {
  //   if (t.status !== "Resolved") return false;

  //   const created = new Date(t.createdAt);
  //   return (
  //     created.getFullYear() === today.getFullYear() &&
  //     created.getMonth() === today.getMonth() &&
  //     created.getDate() === today.getDate()
  //   );
  // }).length;
  const resolvedCount = tickets.filter(
  (ticket) => ticket.status === "Resolved"
).length;

  const stats: Stat[] = [
    {
      label: "Open Tickets",
      value: String(openCount).padStart(2, "0"),
      sub: "Awaiting resolution",
      icon: TicketIcon,
      progress: tickets.length ? (openCount / tickets.length) * 100 : 0,
      tone: "green",
      caption: `${openCount} open tickets`,
    },
    {
      label: "In Progress",
      value: String(inProgressCount).padStart(2, "0"),
      sub: "Being handled",
      icon: Clock3,
      progress: tickets.length
        ? (inProgressCount / tickets.length) * 100
        : 0,
      tone: "blue",
      caption: `${inProgressCount} tickets being handled`,
    },
    {
      label: "Critical / High",
      value: String(criticalHighCount).padStart(2, "0"),
      sub: "Need attention",
      icon: AlertTriangle,
      progress: tickets.length
        ? (criticalHighCount / tickets.length) * 100
        : 0,
      tone: "red",
      caption: `${criticalHighCount} high-priority tickets`,
    },
      {
    label: "Resolved Tickets",
    value: String(resolvedCount).padStart(2, "0"),
    sub: "Total resolved tickets",
    icon: CircleCheck,
    progress: tickets.length
      ? (resolvedCount / tickets.length) * 100
      : 0,
    tone: "purple",
    caption: `${resolvedCount} tickets resolved`,
  },
  ];

  const urgentTickets = tickets
    .filter(
      (ticket) =>
        ticket.status !== "Resolved" && ticket.status !== "Closed"
    )
    .sort((a, b) => {
      const priorityRank: Record<Priority, number> = {
        Critical: 0,
        High: 1,
        Medium: 2,
        Low: 3,
      };

      return (
        priorityRank[a.priority] - priorityRank[b.priority] ||
        new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
      );
    })
    .slice(0, 5);

  return (
    <DashboardLayout>
      <main className="portal-page">
        <div className="page-heading">
          <div>
            <h1>Admin Overview</h1>
            <p>
              Monitor author support and resolve the most urgent requests
              first.
            </p>
          </div>

          <Link className="primary-btn" to="/admin/tickets">
            Manage tickets →
          </Link>
        </div>

        {error && (
          <div role="alert" className="error-message">
            {error}
          </div>
        )}

        <div className="stat-grid admin-stats">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className={`stat-card admin-stat-card ${stat.tone}`}
              >
                <div className="admin-stat-top">
                  <span>{stat.label}</span>
                  <div className={`admin-stat-icon ${stat.tone}`}>
                    <Icon size={19} />
                  </div>
                </div>

                <div className="admin-stat-main">
                  <div>
                    <strong>{loading ? "—" : stat.value}</strong>
                    <p>{stat.sub}</p>
                  </div>

                  <div
                    className={`progress-ring ${stat.tone}-ring`}
                    style={progressStyle(stat.progress)}
                  >
                    <span>{Math.round(stat.progress)}%</span>
                  </div>
                </div>

                <small>{stat.caption}</small>
              </div>
            );
          })}
        </div>

        <section className="panel">
          <div className="panel__header">
            <div className="panel__title-row">
              <AlertTriangle size={16} />
              <h2>Tickets requiring attention</h2>
            </div>

            <Link className="text-link" to="/admin/tickets">
              View all →
            </Link>
          </div>

          {loading ? (
            <p className="muted">Loading tickets…</p>
          ) : urgentTickets.length === 0 ? (
            <p className="muted">No tickets currently require attention.</p>
          ) : (
            <div className="table-wrap">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Waiting</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {urgentTickets.map((ticket) => (
                    <tr key={ticket._id}>
                      <td>
                        <strong>{ticket.subject}</strong>
                        <br />
                        <span className="muted">
                          {ticket.author?.name ??
                            ticket.author?.email ??
                            ticket._id}
                        </span>
                      </td>

                      <td>{ticket.category}</td>

                      <td>
                        <span className={priorityClass[ticket.priority]}>
                          {ticket.priority}
                        </span>
                      </td>

                      <td>{ticketAge(ticket.createdAt)}</td>

                      <td style={{ textAlign: "right" }}>
                        <Link
                          to={`/admin/tickets/${ticket._id}`}
                          className="review-btn"
                        >
                          Review →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </DashboardLayout>
  );
}
