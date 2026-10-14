
import { Link, useParams } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useState } from "react";

export default function AdminTicketDetails() {
  const { ticketId } = useParams();
  const [category, setCategory] = useState("Royalty & Payments");
  const [priority, setPriority] = useState("High");
  const [status, setStatus] = useState("In Progress");
  const [notes, setNotes] = useState("");
  const [draft, setDraft] = useState(
    "Hello Pranita,\n\nThank you for contacting BookLeaf support. We are reviewing your royalty payment records and will share an update once verification is complete.\n\nRegards,\nBookLeaf Publishing Support"
  );

  function saveChanges(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.alert("Demo only: ticket changes abhi backend par save nahi hue.");
  }

  function generateDemoDraft() {
    // Placeholder only. Real AI generation API se hoga.
    setDraft(
      `Hello Pranita,\n\nThank you for reaching out about ${category.toLowerCase()}. Our team is reviewing your request. We will provide a verified update as soon as possible.\n\nRegards,\nBookLeaf Publishing Support`
    );
  }

  return (
    <DashboardLayout>
      <main className="portal-page">
        <div className="page-heading">
          <div>
            <p><Link to="/admin/tickets">← Back to all tickets</Link></p>
            <h1>Ticket details</h1>
            <p>{ticketId} · Pending royalty payment · Author: Pranita Aeer</p>
          </div>
          <span className="status-pill">{status}</span>
        </div>

        <form onSubmit={saveChanges}>
          <section className="panel">
            <h2>Author's request</h2>
            <p className="muted">Original query</p>
            <p>I have not received the royalty payment for my latest sales. Could you please check the payment status?</p>
          </section>

          <section className="panel">
            <h2>Ticket management</h2>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="admin-category">Category</label>
                <select id="admin-category" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option>Royalty &amp; Payments</option>
                  <option>ISBN &amp; Metadata Issues</option>
                  <option>Printing &amp; Quality</option>
                  <option>Distribution &amp; Availability</option>
                  <option>Book Status &amp; Production Updates</option>
                  <option>General Inquiry</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="admin-priority">Priority</label>
                <select id="admin-priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="admin-status">Status</label>
                <select id="admin-status" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option>Open</option><option>In Progress</option><option>Resolved</option><option>Closed</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="assignee">Assigned to</label>
                <select id="assignee" defaultValue="support">
                  <option value="support">Publishing Support</option>
                  <option value="royalty">Royalty Team</option>
                  <option value="production">Production Team</option>
                </select>
              </div>

              <div className="field full-width">
                <label htmlFor="internal-notes">Internal notes (admin only)</label>
                <textarea id="internal-notes" value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes. These should not be visible to the author." />
              </div>
            </div>
          </section>

          <section className="panel">
            <h2>AI Reply Composer</h2>
            <p className="muted">
              Draft a response from the ticket and the publishing Knowledge Base.
              Review and edit it before sending.
            </p>

            <button className="secondary-btn" type="button" onClick={generateDemoDraft}>
              Generate demo draft
            </button>

            <div className="field" style={{ marginTop: 18 }}>
              <label htmlFor="reply-draft">Editable reply</label>
              <textarea id="reply-draft" style={{ minHeight: 220 }}
                value={draft} onChange={(e) => setDraft(e.target.value)} />
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
              <button className="primary-btn" type="submit">Save ticket changes</button>
              <button className="secondary-btn" type="button"
                onClick={() => window.alert("Demo only: reply send API abhi connected nahi hai.")}>
                Send reply to author
              </button>
            </div>
          </section>
        </form>
      </main>
    </DashboardLayout>
  );
}
