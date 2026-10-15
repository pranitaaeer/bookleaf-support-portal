import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { CircleCheck, Clock3, AlertTriangle, Ticket } from "lucide-react";
import type { CSSProperties } from "react";

type Priority = "High" | "Medium" | "Low";

type TicketItem = {
  id: string;
  subject: string;
  category: string;
  priority: Priority;
  age: string;
};

const urgentTickets: TicketItem[] = [
  {
    id: "TKT-1024",
    subject: "Pending royalty payment",
    category: "Royalty & Payments",
    priority: "High",
    age: "2 hours ago",
  },
  {
    id: "TKT-1021",
    subject: "ISBN correction request",
    category: "ISBN & Metadata Issues",
    priority: "Medium",
    age: "Yesterday",
  },
  {
    id: "TKT-1018",
    subject: "Book distribution update",
    category: "Distribution & Availability",
    priority: "Low",
    age: "3 days ago",
  },
];

const priorityClass: Record<Priority, string> = {
  High: "priority-badge priority-badge--high",
  Medium: "priority-badge priority-badge--medium",
  Low: "priority-badge priority-badge--low",
};

type StatTone = "green" | "blue" | "red" | "purple";

type Stat = {
  label: string;
  value: string;
  sub: string;
  icon: typeof Ticket;
  progress: number;
  tone: StatTone;
  caption: string;
};

const stats: Stat[] = [
  {
    label: "Open Tickets",
    value: "18",
    sub: "Awaiting resolution",
    icon: Ticket,
    progress: 72,
    tone: "green",
    caption: "18 of 25 ticket capacity",
  },
  {
    label: "In Progress",
    value: "07",
    sub: "Being handled",
    icon: Clock3,
    progress: 35,
    tone: "blue",
    caption: "7 of 20 active tickets",
  },
  {
    label: "Critical / High",
    value: "04",
    sub: "Need attention",
    icon: AlertTriangle,
    progress: 20,
    tone: "red",
    caption: "4 of 20 active tickets",
  },
  {
    label: "Resolved Today",
    value: "12",
    sub: "Successfully resolved",
    icon: CircleCheck,
    progress: 80,
    tone: "purple",
    caption: "12 of 15 daily target",
  },
];

// Helper to safely pass a CSS custom property to style
const progressStyle = (progress: number): CSSProperties =>
  ({ "--progress": `${progress}%` }) as CSSProperties;

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <main className="portal-page">
        <div className="page-heading">
          <div>
            <h1>Admin Overview</h1>
            <p>
              Monitor author support and resolve the most urgent requests first.
            </p>
          </div>
          <Link className="primary-btn" to="/admin/tickets">
            Manage tickets →
          </Link>
        </div>

        <div className="stat-grid admin-stats">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className={`stat-card admin-stat-card ${s.tone}`}
              >
                <div className="admin-stat-top">
                  <span>{s.label}</span>
                  <div className={`admin-stat-icon ${s.tone}`}>
                    <Icon size={19} />
                  </div>
                </div>

                <div className="admin-stat-main">
                  <div>
                    <strong>{s.value}</strong>
                    <p>{s.sub}</p>
                  </div>
                  <div
                    className={`progress-ring ${s.tone}-ring`}
                    style={progressStyle(s.progress)}
                  >
                    <span>{s.progress}%</span>
                  </div>
                </div>

                <small>{s.caption}</small>
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
                  <tr key={ticket.id}>
                    <td>
                      <strong>{ticket.subject}</strong>
                      <br />
                      <span className="muted">{ticket.id}</span>
                    </td>
                    <td>{ticket.category}</td>
                    <td>
                      <span className={priorityClass[ticket.priority]}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td>{ticket.age}</td>
                    <td style={{ textAlign: "right" }}>
                      <Link
                        to={`/admin/tickets/${ticket.id}`}
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
        </section>
      </main>
    </DashboardLayout>
  );
}