
import { Link, useParams } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useState } from "react";

export default function AuthorTicketDetails() {
  const { ticketId } = useParams();
  const [reply, setReply] = useState("");

  function sendReply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.alert("Demo only: reply backend par save nahi hua.");
    setReply("");
  }

  return (
    <DashboardLayout>
      <main className="portal-page">
        <div className="page-heading">
          <div>
            <p><Link to="/author/tickets">← Back to My Tickets</Link></p>
            <h1>Pending royalty payment</h1>
            <p>{ticketId} · Royalty &amp; Payments · Created 12 Oct 2026</p>
          </div>
          <span className="status-pill">In Progress</span>
        </div>

        <section className="panel">
          <h2>Conversation</h2>
          <article className="message">
            <strong>Your original query</strong>
            <p className="muted">12 Oct 2026 · You</p>
            <p>I have not received the royalty payment for my latest sales. Could you please check the payment status?</p>
          </article>

          <article className="message">
            <strong>Publishing Support</strong>
            <p className="muted">12 Oct 2026 · Admin reply</p>
            <p>Thank you for contacting us. We are checking the payment records for your book and will update you here.</p>
          </article>
        </section>

        <section className="panel">
          <h2>Send a reply</h2>
          <form onSubmit={sendReply}>
            <div className="field">
              <label htmlFor="reply">Your message</label>
              <textarea id="reply" required minLength={2}
                value={reply} onChange={(e) => setReply(e.target.value)}
                placeholder="Write a message..." />
            </div>
            <button className="primary-btn" type="submit" style={{ marginTop: 16 }}>
              Send reply
            </button>
          </form>
        </section>
      </main>
    </DashboardLayout>
  );
}
