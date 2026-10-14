
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";

export default function CreateTicket() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("General Inquiry");
  const [book, setBook] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Abhi API nahi hai. Ticket data save nahi hota.
    window.alert("Demo only: ticket API abhi connect nahi hui hai.");
    navigate("/author/tickets");
  }

  return (
    <DashboardLayout>
      <main className="portal-page">
        <div className="page-heading">
          <div>
            <h1>Create a Support Ticket</h1>
            <p>Tell our publishing support team what you need help with.</p>
          </div>
        </div>

        <section className="panel">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="category">Issue category</label>
                <select id="category" value={category}
                  onChange={(e) => setCategory(e.target.value)}>
                  <option>General Inquiry</option>
                  <option>Royalty &amp; Payments</option>
                  <option>ISBN &amp; Metadata Issues</option>
                  <option>Printing &amp; Quality</option>
                  <option>Distribution &amp; Availability</option>
                  <option>Book Status &amp; Production Updates</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="book">Related book (optional)</label>
                <select id="book" value={book} onChange={(e) => setBook(e.target.value)}>
                  <option value="">General / account issue</option>
                  <option value="BK001">The Art of Starting Over</option>
                  <option value="BK002">Whispers of the Monsoon</option>
                  <option value="BK003">The Quiet Revolution</option>
                  <option value="BK004">Letters to My Younger Self</option>
                </select>
              </div>

              <div className="field full-width">
                <label htmlFor="subject">Subject</label>
                <input id="subject" required maxLength={150}
                  value={subject} onChange={(e) => setSubject(e.target.value)}
                  placeholder="Briefly describe your issue" />
              </div>

              <div className="field full-width">
                <label htmlFor="description">Description</label>
                <textarea id="description" required minLength={10}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Include relevant details so we can help you..." />
              </div>

              <div className="field full-width">
                <label htmlFor="attachment">Attachment (optional)</label>
                <input id="attachment" type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={(e) => setAttachment(e.target.files?.[0] ?? null)} />
                <small className="muted">
                  {attachment ? `Selected: ${attachment.name}` : "PDF, images or documents. Upload limits will be enforced by the backend."}
                </small>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 22, flexWrap: "wrap" }}>
              <button className="primary-btn" type="submit">Submit ticket</button>
              <button className="secondary-btn" type="button"
                onClick={() => navigate("/author/tickets")}>Cancel</button>
            </div>
          </form>
        </section>
      </main>
    </DashboardLayout>
  );
}
