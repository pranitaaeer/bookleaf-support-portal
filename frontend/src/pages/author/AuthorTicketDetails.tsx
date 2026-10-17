
// import { Link, useParams } from "react-router-dom";
// import DashboardLayout from "../../components/layout/DashboardLayout";
// import { useState } from "react";

// export default function AuthorTicketDetails() {
//   const { ticketId } = useParams();
//   const [reply, setReply] = useState("");

//   function sendReply(event: React.FormEvent<HTMLFormElement>) {
//     event.preventDefault();
//     window.alert("Demo only: reply backend par save nahi hua.");
//     setReply("");
//   }

//   return (
//     <DashboardLayout>
//       <main className="portal-page">
//         <div className="page-heading">
//           <div>
//             <p><Link to="/author/tickets">← Back to My Tickets</Link></p>
//             <h1>Pending royalty payment</h1>
//             <p>{ticketId} · Royalty &amp; Payments · Created 12 Oct 2026</p>
//           </div>
//           <span className="status-pill">In Progress</span>
//         </div>

//         <section className="panel">
//           <h2>Conversation</h2>
//           <article className="message">
//             <strong>Your original query</strong>
//             <p className="muted">12 Oct 2026 · You</p>
//             <p>I have not received the royalty payment for my latest sales. Could you please check the payment status?</p>
//           </article>

//           <article className="message">
//             <strong>Publishing Support</strong>
//             <p className="muted">12 Oct 2026 · Admin reply</p>
//             <p>Thank you for contacting us. We are checking the payment records for your book and will update you here.</p>
//           </article>
//         </section>

//         <section className="panel">
//           <h2>Send a reply</h2>
//           <form onSubmit={sendReply}>
//             <div className="field">
//               <label htmlFor="reply">Your message</label>
//               <textarea id="reply" required minLength={2}
//                 value={reply} onChange={(e) => setReply(e.target.value)}
//                 placeholder="Write a message..." />
//             </div>
//             <button className="primary-btn" type="submit" style={{ marginTop: 16 }}>
//               Send reply
//             </button>
//           </form>
//         </section>
//       </main>
//     </DashboardLayout>
//   );
// }

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
  
  const [reply, setReply] = useState("");
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
  async function sendReply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reply.trim() || submitting) return;

    try {
      setSubmitting(true);
      await api.post(`/tickets/${ticketId}/reply`, { message: reply.trim() });
      
      toast.success("Reply sent successfully!");
      setReply("");
      
      // Re-fetch details to show the new message
      const response = await api.get(`/tickets/${ticketId}`);
      setTicket(response.data.data);

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send reply.");
    } finally {
      setSubmitting(false);
    }
  }

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

        <section className="panel">
          <h2>Send a reply</h2>
          <form onSubmit={sendReply}>
            <div className="field">
              <label htmlFor="reply">Your message</label>
              <textarea 
                id="reply" 
                required 
                minLength={2}
                value={reply} 
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write a message..." 
                disabled={submitting}
              />
            </div>
            <button className="primary-btn" type="submit" style={{ marginTop: 16 }} disabled={submitting}>
              {submitting ? "Sending..." : "Send reply"}
            </button>
          </form>
        </section>
      </main>
    </DashboardLayout>
  );
}