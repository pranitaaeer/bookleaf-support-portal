
import { Link, useParams } from "react-router-dom";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";
import { toast } from "react-toastify";

type Author = { _id?: string; name?: string; email?: string; phone?: string };
type Book = { _id?: string; title?: string; isbn?: string; status?: string };
type InternalNote = { _id?: string; adminId?: string; note: string; createdAt: string };
type TicketMessage = { _id: string; message: string; senderRole: string; isInternal?: boolean; createdAt: string };
type Ticket = {
  _id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  assignedAdmin?: string | null;
  resolvedAt?: string | null;
  author?: Author | null;
  book?: Book | null;
  createdAt: string;
};
type ApiResponse<T> = { success: boolean; message?: string; data: T };
type PaginationInfo = { page: number; limit: number; totalItems: number; totalPages: number };
type PaginatedResponse<T> = ApiResponse<{ items: T[]; pagination: PaginationInfo }>;

const PAGE_SIZE = 5;
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
const assignees = [
  { value: "support", label: "Publishing Support" },
  { value: "royalty", label: "Royalty Team" },
  { value: "production", label: "Production Team" },
];
const emptyPagination: PaginationInfo = { page: 1, limit: PAGE_SIZE, totalItems: 0, totalPages: 0 };

function PaginationControls({
  pagination,
  loading,
  onPrevious,
  onNext,
}: {
  pagination: PaginationInfo;
  loading: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const totalPages = Math.max(1, pagination.totalPages);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
      <small className="muted">
        {pagination.totalItems === 0
          ? "0 items"
          : `Showing page ${pagination.page} of ${totalPages} · ${pagination.totalItems} total`}
      </small>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="secondary-btn" type="button" onClick={onPrevious} disabled={loading || pagination.page <= 1}>
          Previous
        </button>
        <button className="secondary-btn" type="button" onClick={onNext} disabled={loading || pagination.totalPages === 0 || pagination.page >= pagination.totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}

export default function AdminTicketDetails() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [assignedAdmin, setAssignedAdmin] = useState("support");
  const [notes, setNotes] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [generatingDraft, setGeneratingDraft] = useState(false);

  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [internalNotes, setInternalNotes] = useState<InternalNote[]>([]);
  const [messagesPage, setMessagesPage] = useState(1);
  const [notesPage, setNotesPage] = useState(1);
  const [messagesPagination, setMessagesPagination] = useState<PaginationInfo>(emptyPagination);
  const [notesPagination, setNotesPagination] = useState<PaginationInfo>(emptyPagination);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);

  const loadTicket = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<Ticket>>(`/admin/tickets/${ticketId}`);
      const data = response.data.data;
      setTicket(data);
      setCategory(data.category);
      setPriority(data.priority);
      setStatus(data.status);
      const assignment = data.assignedAdmin;
      setAssignedAdmin(assignment && assignees.some((item) => item.value === assignment) ? assignment : "support");
      setDraft((current) => current || `Hello ${data.author?.name || "Author"},\n\nThank you for contacting BookLeaf Publishing Support. We are reviewing your request and will share an update once verification is complete.\n\nRegards,\nBookLeaf Publishing Support`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Unable to load ticket details.");
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  const loadMessages = useCallback(async () => {
    if (!ticketId) return;
    setLoadingMessages(true);
    try {
      const response = await api.get<PaginatedResponse<TicketMessage>>(`/admin/tickets/${ticketId}/messages`, {
        params: { page: messagesPage, limit: PAGE_SIZE },
      });
      setMessages(response.data.data.items);
      setMessagesPagination(response.data.data.pagination);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Unable to load replies.");
    } finally {
      setLoadingMessages(false);
    }
  }, [ticketId, messagesPage]);

  const loadInternalNotes = useCallback(async () => {
    if (!ticketId) return;
    setLoadingNotes(true);
    try {
      const response = await api.get<PaginatedResponse<InternalNote>>(`/admin/tickets/${ticketId}/notes`, {
        params: { page: notesPage, limit: PAGE_SIZE },
      });
      setInternalNotes(response.data.data.items);
      setNotesPagination(response.data.data.pagination);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Unable to load internal notes.");
    } finally {
      setLoadingNotes(false);
    }
  }, [ticketId, notesPage]);

  useEffect(() => { void loadTicket(); }, [loadTicket]);
  useEffect(() => { void loadMessages(); }, [loadMessages]);
  useEffect(() => { void loadInternalNotes(); }, [loadInternalNotes]);

  async function saveChanges(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ticketId || saving) return;
    setSaving(true);
    try {
      const response = await api.patch<ApiResponse<Ticket>>(`/admin/tickets/${ticketId}`, {
        category, priority, status, assignedAdmin,
      });
      setTicket((previous) => previous ? { ...previous, ...response.data.data } : response.data.data);
      toast.success(response.data.message || "Ticket changes saved.");
      // Keep the UI in sync with the values saved in the form without reloading the reply composer.
      setTicket((previous) => previous ? { ...previous, category, priority, status, assignedAdmin } : previous);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save ticket changes.");
    } finally {
      setSaving(false);
    }
  }

  async function addInternalNote() {
    if (!ticketId || addingNote) return;
    if (!notes.trim()) {
      toast.warning("Please enter an internal note first.");
      return;
    }
    setAddingNote(true);
    try {
      const response = await api.post<ApiResponse<unknown>>(`/admin/tickets/${ticketId}/notes`, { note: notes.trim() });
      setNotes("");
      toast.success(response.data.message || "Internal note added.");
      if (notesPage === 1) await loadInternalNotes();
      else setNotesPage(1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add internal note.");
    } finally {
      setAddingNote(false);
    }
  }

  async function sendReply() {
    if (!ticketId || sendingReply) return;
    if (!draft.trim()) {
      toast.warning("Please enter a reply before sending.");
      return;
    }
    setSendingReply(true);
    try {
      const response = await api.post<ApiResponse<TicketMessage>>(`/admin/tickets/${ticketId}/reply`, { message: draft.trim() });
      toast.success(response.data.message || "Reply sent successfully.");
      setDraft("");
      // The backend moves Open tickets to In Progress when a reply is sent.
      setTicket((previous) => previous ? { ...previous, status: previous.status === "Open" ? "In Progress" : previous.status } : previous);
      setStatus((previous) => previous === "Open" ? "In Progress" : previous);
      if (messagesPage === 1) await loadMessages();
      else setMessagesPage(1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send reply.");
    } finally {
      setSendingReply(false);
    }
  }

  async function generateAIDraft() {
    if (!ticketId || generatingDraft) return;
    setGeneratingDraft(true);
    try {
      const response = await api.post<ApiResponse<{ draft: string; generatedAt: string }>>(`/admin/tickets/${ticketId}/ai-draft`);
      setDraft(response.data.data.draft);
      toast.success("AI reply draft generated.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Unable to generate AI draft.");
    } finally {
      setGeneratingDraft(false);
    }
  }

  if (loading) {
    return <DashboardLayout><main className="portal-page"><p>Loading ticket details...</p></main></DashboardLayout>;
  }

  if (!ticket) {
    return <DashboardLayout><main className="portal-page"><p>Ticket details could not be loaded.</p><Link to="/admin/tickets">← Back to all tickets</Link></main></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <main className="portal-page">
        <div className="page-heading">
          <div>
            <p><Link to="/admin/tickets">← Back to all tickets</Link></p>
            <h1>Ticket details</h1>
            <p>{ticket._id} · {ticket.subject} · Author: {ticket.author?.name || "Unknown"}</p>
          </div>
          <span className="status-pill">{status}</span>
        </div>

        <section className="panel">
          <h2>Author&apos;s request</h2>
          <p className="muted">Original query</p>
          <p>{ticket.description}</p>
          {ticket.book && <p><strong>Book:</strong> {ticket.book.title || "Untitled"}{ticket.book.isbn ? ` · ISBN: ${ticket.book.isbn}` : ""}</p>}
          {ticket.author?.email && <p><strong>Author email:</strong> {ticket.author.email}</p>}
          <p className="muted">Created: {new Date(ticket.createdAt).toLocaleString()}</p>
        </section>

        <form onSubmit={saveChanges}>
          <section className="panel">
            <h2>Ticket management</h2>
            <div className="form-grid">
              <div className="field"><label htmlFor="admin-category">Category</label><select id="admin-category" value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
              <div className="field"><label htmlFor="admin-priority">Priority</label><select id="admin-priority" value={priority} onChange={(event) => setPriority(event.target.value)}>{priorities.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
              <div className="field"><label htmlFor="admin-status">Status</label><select id="admin-status" value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
              <div className="field"><label htmlFor="assignee">Assigned to</label><select id="assignee" value={assignedAdmin} onChange={(event) => setAssignedAdmin(event.target.value)}>{assignees.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
            </div>
            <div style={{ marginTop: 18 }}><button className="primary-btn" type="submit" disabled={saving}>{saving ? "Saving changes..." : "Save ticket changes"}</button></div>
          </section>
        </form>

        <section className="panel">
          <h2>Internal notes (admin only)</h2>
          <p className="muted">These notes are for internal use and are not sent to the author.</p>
          <div className="field"><label htmlFor="internal-notes">Add an internal note</label><textarea id="internal-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add internal notes. These should not be visible to the author." /></div>
          <button className="primary-btn" type="button" onClick={addInternalNote} disabled={addingNote} style={{ marginTop: 12 }}>{addingNote ? "Adding note..." : "Add internal note"}</button>

          <div style={{ marginTop: 20 }}>
            {loadingNotes ? <p className="muted">Loading internal notes...</p> : internalNotes.length ? internalNotes.map((item, index) => (
              <div key={item._id || `${item.createdAt}-${index}`} style={{ padding: 12, marginBottom: 10, border: "1px solid #e5e7eb", borderRadius: 8 }}>
                <p style={{ whiteSpace: "pre-wrap" }}>{item.note}</p>
                <small className="muted">{new Date(item.createdAt).toLocaleString()}</small>
              </div>
            )) : <p className="muted">No internal notes yet.</p>}
            <PaginationControls pagination={notesPagination} loading={loadingNotes} onPrevious={() => setNotesPage((page) => Math.max(1, page - 1))} onNext={() => setNotesPage((page) => Math.min(notesPagination.totalPages, page + 1))} />
          </div>
        </section>

        <section className="panel">
          <h2>AI Reply Composer</h2>
          <p className="muted">Generate a draft, review it, and edit it before sending it to the author.</p>
          <button className="secondary-btn" type="button" onClick={generateAIDraft} disabled={generatingDraft}>{generatingDraft ? "Generating draft..." : "Generate AI draft"}</button>
          <div className="field" style={{ marginTop: 18 }}><label htmlFor="reply-draft">Editable reply</label><textarea id="reply-draft" style={{ minHeight: 220 }} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write the reply to the author..." /></div>
          <button className="primary-btn" type="button" onClick={sendReply} disabled={sendingReply} style={{ marginTop: 18 }}>{sendingReply ? "Sending reply..." : "Send reply to author"}</button>

          <div style={{ marginTop: 20 }}>
            <h3>Previous replies</h3>
            {loadingMessages ? <p className="muted">Loading replies...</p> : messages.length ? messages.map((message) => (
              <div key={message._id} style={{ padding: 12, marginBottom: 10, border: "1px solid #e5e7eb", borderRadius: 8 }}>
                <p style={{ whiteSpace: "pre-wrap" }}>{message.message}</p>
                <small className="muted">{message.senderRole} · {new Date(message.createdAt).toLocaleString()}</small>
              </div>
            )) : <p className="muted">No replies yet.</p>}
            <PaginationControls pagination={messagesPagination} loading={loadingMessages} onPrevious={() => setMessagesPage((page) => Math.max(1, page - 1))} onNext={() => setMessagesPage((page) => Math.min(messagesPagination.totalPages, page + 1))} />
          </div>
        </section>
      </main>
    </DashboardLayout>
  );
}

