
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";

const tickets = [
  { id: "TKT-1024", subject: "Pending royalty payment", category: "Royalty & Payments", status: "In Progress", priority: "High", date: "12 Oct 2026" },
  { id: "TKT-1021", subject: "ISBN correction request", category: "ISBN & Metadata Issues", status: "Open", priority: "Medium", date: "11 Oct 2026" },
  { id: "TKT-1018", subject: "Book distribution update", category: "Distribution & Availability", status: "Resolved", priority: "Low", date: "08 Oct 2026" },
];

export default function MyTickets() {
  return (
    <DashboardLayout>
      <main className="portal-page">
        <div className="page-heading">
          <div>
            <h1>My Support Tickets</h1>
            <p>Review requests and track responses from the support team.</p>
          </div>
          <Link className="primary-btn" to="/author/tickets/new">+ Create ticket</Link>
        </div>

        <section className="panel">
          <div className="toolbar">
            <input aria-label="Search tickets" placeholder="Search ticket ID or subject..." />
            <select aria-label="Filter ticket status" defaultValue="all">
              <option value="all">All statuses</option>
              <option>Open</option>
              <option>In Progress</option>
              <option>Resolved</option>
              <option>Closed</option>
            </select>
          </div>

          <div className="ticket-list">
            {tickets.map((ticket) => (
              <article className="ticket-item" key={ticket.id}>
                <div>
                  <h3>{ticket.subject}</h3>
                  <p>{ticket.id} · {ticket.category} · {ticket.date}</p>
                  <p style={{ marginTop: 8 }}>Priority: {ticket.priority}</p>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span className="status-pill">{ticket.status}</span>
                  <Link to={`/author/tickets/${ticket.id}`}>View details →</Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </DashboardLayout>
  );
}
