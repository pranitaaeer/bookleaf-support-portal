
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useState } from "react";

const allTickets = [
  { id: "TKT-1024", subject: "Pending royalty payment", category: "Royalty & Payments", status: "In Progress", priority: "High", date: "12 Oct 2026" },
  { id: "TKT-1021", subject: "ISBN correction request", category: "ISBN & Metadata Issues", status: "Open", priority: "Medium", date: "11 Oct 2026" },
  { id: "TKT-1018", subject: "Book distribution update", category: "Distribution & Availability", status: "Resolved", priority: "Low", date: "08 Oct 2026" },
  { id: "TKT-1017", subject: "Printing quality concern", category: "Printing & Quality", status: "Open", priority: "Critical", date: "07 Oct 2026" },
];

export default function AdminTickets() {
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");
  const [priority, setPriority] = useState("All");

  const filteredTickets = allTickets.filter((ticket) =>
    (status === "All" || ticket.status === status) &&
    (category === "All" || ticket.category === category) &&
    (priority === "All" || ticket.priority === priority)
  );

  return (
    <DashboardLayout>
      <main className="portal-page">
        <div className="page-heading">
          <div>
            <h1>Support Tickets</h1>
            <p>Filter, prioritize, and manage author requests.</p>
          </div>
        </div>

        <section className="panel">
          <div className="toolbar">
            <select aria-label="Filter status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>All</option><option>Open</option><option>In Progress</option><option>Resolved</option><option>Closed</option>
            </select>

            <select aria-label="Filter category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>All</option>
              <option>Royalty &amp; Payments</option>
              <option>ISBN &amp; Metadata Issues</option>
              <option>Printing &amp; Quality</option>
              <option>Distribution &amp; Availability</option>
              <option>Book Status &amp; Production Updates</option>
              <option>General Inquiry</option>
            </select>

            <select aria-label="Filter priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option>All</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
            </select>
          </div>

          <div className="table-wrap">
            <table className="portal-table">
              <thead>
                <tr><th>Ticket</th><th>Category</th><th>Status</th><th>Priority</th><th>Date</th><th>Action</th></tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td><strong>{ticket.subject}</strong><br /><span className="muted">{ticket.id}</span></td>
                    <td>{ticket.category}</td>
                    <td><span className="status-pill">{ticket.status}</span></td>
                    <td>{ticket.priority}</td>
                    <td>{ticket.date}</td>
                    <td><Link to={`/admin/tickets/${ticket.id}`}>Open →</Link></td>
                  </tr>
                ))}
                {filteredTickets.length === 0 && (
                  <tr><td colSpan={6}>No tickets match these filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </DashboardLayout>
  );
}
