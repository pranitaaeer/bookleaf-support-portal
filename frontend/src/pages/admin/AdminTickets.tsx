import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

type Ticket = {
  _id: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  createdAt: string;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  count?: number;
  data: Ticket[];
};

const categories = [
  "Royalty & Payments",
  "ISBN & Metadata Issues",
  "Printing & Quality",
  "Distribution & Availability",
  "Book Status & Production Updates",
  "General Inquiry",
];

const priorities = ["Critical", "High", "Medium", "Low"];
const statuses = ["Open", "In Progress", "Resolved", "Closed"];

const unresolvedStatuses = ["Open", "In Progress"];

function getPriorityClass(priority: string) {
  switch (priority) {
    case "Critical":
      return "priority-critical";
    case "High":
      return "priority-high";
    case "Medium":
      return "priority-medium";
    default:
      return "priority-low";
  }
}

export default function AdminTickets() {
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");
  const [priority, setPriority] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const invalidDateRange = Boolean(from && to && from > to);

  useEffect(() => {
    let cancelled = false;

    async function loadTickets() {
      if (invalidDateRange) {
        setTickets([]);
        setError("From Date cannot be later than To Date.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const params: Record<string, string> = {};

        if (status !== "All") params.status = status;
        if (category !== "All") params.category = category;
        if (priority !== "All") params.priority = priority;
        if (from) params.from = from;
        if (to) params.to = to;

        const response = await api.get<ApiResponse>("/admin/tickets", {
          params,
        });

        if (!cancelled) {
          setTickets(response.data.data ?? []);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err.response?.data?.message || "Unable to load support tickets.",
          );
          setTickets([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadTickets();

    return () => {
      cancelled = true;
    };
  }, [status, category, priority, from, to, reloadKey, invalidDateRange]);

  // Show unresolved tickets first, oldest ticket first within each group.
  const sortedTickets = useMemo(() => {
    return [...tickets].sort((a, b) => {
      const aUnresolved = unresolvedStatuses.includes(a.status);
      const bUnresolved = unresolvedStatuses.includes(b.status);

      if (aUnresolved !== bUnresolved) {
        return aUnresolved ? -1 : 1;
      }

      // Within unresolved tickets, Critical and High priorities come first.
      if (aUnresolved && bUnresolved) {
        const priorityRank: Record<string, number> = {
          Critical: 0,
          High: 1,
          Medium: 2,
          Low: 3,
        };

        const priorityDifference =
          (priorityRank[a.priority] ?? 4) - (priorityRank[b.priority] ?? 4);

        if (priorityDifference !== 0) {
          return priorityDifference;
        }
      }

      // Oldest first for tickets with the same grouping/priority.
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [tickets]);

  const oldestUnresolvedId = useMemo(() => {
    const unresolved = tickets
      .filter((ticket) => unresolvedStatuses.includes(ticket.status))
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );

    return unresolved[0]?._id;
  }, [tickets]);

  return (
    <DashboardLayout>
      <main className="portal-page">
        <div className="page-heading">
          <div>
            <h1>Ticket Queue</h1>
            <p>Filter, prioritize, and manage author requests.</p>
          </div>
        </div>
        <div className="ai-classification-note">
          <div className="ai-classification-title">
            ✨ AI-Assisted Classification
          </div>
          <p>
            AI automatically suggests ticket category and priority. Admins can
            review and change them manually.
          </p>
        </div>

        <section className="panel">
          <div className="toolbar">
            <select
              aria-label="Filter status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="All">All statuses</option>
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="All">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="All">All priorities</option>
              {priorities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="toolbar" style={{ marginTop: 16, alignItems: "end" }}>
            <div className="field">
              <label htmlFor="ticket-from-date">From Date</label>
              <input
                id="ticket-from-date"
                type="date"
                value={from}
                max={to || undefined}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="ticket-to-date">To Date</label>
              <input
                id="ticket-to-date"
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                setFrom("");
                setTo("");
              }}
            >
              Clear Dates
            </button>
          </div>

          {loading ? (
            <p className="muted">Loading tickets...</p>
          ) : error ? (
            <div>
              <p role="alert">{error}</p>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setReloadKey((key) => key + 1)}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <p className="muted">{sortedTickets.length} ticket(s) found</p>

              <div className="table-wrap">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Ticket</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sortedTickets.map((ticket) => {
                      const isUnresolved = unresolvedStatuses.includes(
                        ticket.status,
                      );
                      const isUrgent = ["Critical", "High"].includes(
                        ticket.priority,
                      );
                      const isOldest = ticket._id === oldestUnresolvedId;

                      return (
                        <tr
                          key={ticket._id}
                          className={[
                            isUrgent ? "urgent-ticket-row" : "",
                            isOldest ? "oldest-ticket-row" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          <td>
                            <strong>{ticket.subject}</strong>
                            <br />
                            <span className="muted">{ticket._id}</span>
                            <br />

                            {isOldest && (
                              <span className="ticket-badge badge-oldest">
                                Oldest unresolved
                              </span>
                            )}

                            {isUnresolved && isUrgent && (
                              <span className="ticket-badge badge-urgent">
                                {ticket.priority} priority
                              </span>
                            )}
                          </td>

                          <td>{ticket.category}</td>

                          <td>
                            <span className="status-pill">{ticket.status}</span>
                          </td>

                          <td>
                            <span
                              className={`ticket-badge ${getPriorityClass(
                                ticket.priority,
                              )}`}
                            >
                              {ticket.priority}
                            </span>
                          </td>

                          <td>
                            {new Date(ticket.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </td>

                          <td>
                            <Link to={`/admin/tickets/${ticket._id}`}>
                              Open →
                            </Link>
                          </td>
                        </tr>
                      );
                    })}

                    {sortedTickets.length === 0 && (
                      <tr>
                        <td colSpan={6}>No tickets match these filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </main>
    </DashboardLayout>
  );
}
