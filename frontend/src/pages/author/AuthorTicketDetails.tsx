
import { Link, useParams } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";

// Types define karein
type MessageItem = {
  _id: string;
  senderRole: "author" | "admin";
  message: string;
  createdAt: string;
};

type TicketDetails = {
  _id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  messages: MessageItem[];
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  });
};

export default function AuthorTicketDetails() {
  const { ticketId } = useParams();
  
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Ticket Details
  useEffect(() => {
    let active = true;

    async function fetchTicketDetails() {
      try {
        setLoading(true);
        const response = await api.get(`/ticket/${ticketId}`);
        if (active) {
          setTicket(response.data.data);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to load ticket.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void fetchTicketDetails();

    return () => { active = false; };
  }, [ticketId]);

  // 2. Submit Reply
  

  if (loading) {
    return (
      <DashboardLayout>
        <main className="portal-page">
          <p>Loading ticket details...</p>
        </main>
      </DashboardLayout>
    );
  }

  if (!ticket) {
    return (
      <DashboardLayout>
        <main className="portal-page">
          <p>Ticket not found or you don't have access.</p>
          <Link to="/author/tickets">Go back</Link>
        </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <main className="portal-page">
        <div className="page-heading">
          <div>
            <p><Link to="/author/tickets">← Back to My Tickets</Link></p>
            <h1>{ticket.subject}</h1>
            <p>
              {ticket._id} · {ticket.category} · Created {formatDate(ticket.createdAt)}
            </p>
          </div>
          <span className={`status-pill status-${ticket.status.toLowerCase().replace(" ", "-")}`}>
            {ticket.status}
          </span>
        </div>

        <section className="panel">
          <h2>Conversation</h2>
          
          {/* Original Query */}
          <article className="message">
            <strong>Your original query</strong>
            <p className="muted">{formatDate(ticket.createdAt)} · You</p>
            <p>{ticket.description}</p>
          </article>

          {/* Messages Loop */}
          {ticket.messages && ticket.messages.length > 0 ? (
            ticket.messages.map((msg) => (
              <article className="message" key={msg._id}>
                <strong>
                  {msg.senderRole === "author" ? "You" : "Publishing Support"}
                </strong>
                <p className="muted">
                  {formatDate(msg.createdAt)} · {msg.senderRole === "author" ? "Author reply" : "Admin reply"}
                </p>
                <p>{msg.message}</p>
              </article>
            ))
          ) : (
             <p className="muted" style={{ marginTop: "10px" }}>No replies yet.</p>
          )}
        </section>

        
      </main>
    </DashboardLayout>
  );
}