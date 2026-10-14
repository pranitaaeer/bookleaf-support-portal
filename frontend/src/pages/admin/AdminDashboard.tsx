import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { CircleCheck, Clock3, AlertTriangle, Ticket } from "lucide-react";

const urgentTickets = [
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
          <div className="stat-card admin-stat-card">
            <div className="admin-stat-top">
              <span>Open Tickets</span>
              <div className="admin-stat-icon">
                <Ticket size={19} />
              </div>
            </div>
            <div className="admin-stat-main">
              <div>
                <strong>18</strong>
                <p>Awaiting resolution</p>
              </div>
              <div
                className="progress-ring"
                style={{ "--progress": "72%" } as React.CSSProperties}
              >
                <span>72%</span>
              </div>
            </div>
            
            <small>18 of 25 ticket capacity</small>
          </div>

          <div className="stat-card admin-stat-card">
            <div className="admin-stat-top">
              <span>In Progress</span>
              <div className="admin-stat-icon blue">
                <Clock3 size={19} />
              </div>
            </div>
            <div className="admin-stat-main">
              <div>
                <strong>07</strong>
                <p>Being handled</p>
              </div>
              <div
                className="progress-ring blue-ring"
                style={{ "--progress": "35%" } as React.CSSProperties}
              >
                <span>35%</span>
              </div>
            </div>
            
            <small>7 of 20 active tickets</small>
          </div>

          <div className="stat-card admin-stat-card">
            <div className="admin-stat-top">
              <span>Critical / High</span>
              <div className="admin-stat-icon red">
                <AlertTriangle size={19} />
              </div>
            </div>
            <div className="admin-stat-main">
              <div>
                <strong>04</strong>
                <p>Need attention</p>
              </div>
              <div
                className="progress-ring red-ring"
                style={{ "--progress": "20%" } as React.CSSProperties}
              >
                <span>20%</span>
              </div>
            </div>
           
            <small>4 of 20 active tickets</small>
          </div>

          <div className="stat-card admin-stat-card">
            <div className="admin-stat-top">
              <span>Resolved Today</span>
              <div className="admin-stat-icon purple">
                <CircleCheck size={19} />
              </div>
            </div>
            <div className="admin-stat-main">
              <div>
                <strong>12</strong>
                <p>Successfully resolved</p>
              </div>
              <div
                className="progress-ring purple-ring"
                style={{ "--progress": "80%" } as React.CSSProperties}
              >
                <span>80%</span>
              </div>
            </div>
           
            <small>12 of 15 daily target</small>
          </div>
        </div>

        <section className="panel">
          <h2>Tickets requiring attention</h2>
          <div className="table-wrap">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Waiting</th>
                  <th>Action</th>
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
                    <td>{ticket.priority}</td>
                    <td>{ticket.age}</td>
                    <td>
                      <Link to={`/admin/tickets/${ticket.id}`}>Review →</Link>
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
