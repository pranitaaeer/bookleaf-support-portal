
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

interface TicketItem {
  _id: string;
  ticketId?: string;
  subject: string;
  category?: string;
  status: string;
  priority?: string;
  updatedAt?: string;
  createdAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
}

export default function MyTickets() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get<ApiResponse<TicketItem[]>>(
          "/ticket/my-tickets"
        );

        if (!response.data.success) {
          throw new Error(
            response.data.message || "Unable to fetch support tickets."
          );
        }

        setTickets(response.data.data ?? []);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load tickets. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesSearch =
        !query ||
        ticket.subject.toLowerCase().includes(query) ||
        (ticket.ticketId ?? "").toLowerCase().includes(query) ||
        ticket._id.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        ticket.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [tickets, search, statusFilter]);

  const formatDate = (date?: string) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <DashboardLayout>
      <main className="portal-page">
        <div className="page-heading">
          <div>
            <h1>My Support Tickets</h1>
            <p>
              Review requests and track responses from the support team.
            </p>
          </div>

          <Link className="primary-btn" to="/author/tickets/new">
            + Create ticket
          </Link>
        </div>

        <section className="panel">
          <div className="toolbar">
            <input
              aria-label="Search tickets"
              placeholder="Search ticket ID or subject..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              aria-label="Filter ticket status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {loading ? (
            <p className="muted">Loading your support tickets...</p>
          ) : error ? (
            <div>
              <p role="alert">{error}</p>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          ) : filteredTickets.length === 0 ? (
            <p className="muted">
              {tickets.length === 0
                ? "You haven't created any support tickets yet."
                : "No tickets match your search or selected status."}
            </p>
          ) : (
            <div className="ticket-list">
              {filteredTickets.map((ticket) => (
                <article className="ticket-item" key={ticket._id}>
                  <div>
                    <h3>{ticket.subject}</h3>

                    <p>
                      {ticket.ticketId || ticket._id}
                      {" · "}
                      {ticket.category || "General Inquiry"}
                      {" · "}
                      {formatDate(ticket.createdAt ?? ticket.updatedAt)}
                    </p>

                    <p style={{ marginTop: 8 }}>
                      Priority: {ticket.priority || "Medium"}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    <span className="status-pill">{ticket.status}</span>

                    <Link to={`/author/tickets/${ticket._id}`}>
                      View details →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loading && !error && (
            <p className="muted">
              Showing {filteredTickets.length} of {tickets.length} tickets.
            </p>
          )}
        </section>
      </main>
    </DashboardLayout>
  );
}
