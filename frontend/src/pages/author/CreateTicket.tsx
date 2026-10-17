
import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

type Book = {
  _id: string;
  bookId?: string;
  title: string;
  isbn?: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

type ApiError = {
  message?: string;
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  request?: unknown;
};

const categories = [
  "General Inquiry",
  "Royalty & Payments",
  "ISBN & Metadata Issues",
  "Printing & Quality",
  "Distribution & Availability",
  "Book Status & Production Updates",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ["pdf", "png", "jpg", "jpeg", "doc", "docx"];

function getErrorMessage(error: unknown): string {
  const err = error as ApiError;

  if (err.response) {
    return (
      err.response.data?.message ||
      `Request failed (${err.response.status ?? "unknown status"}).`
    );
  }

  if (err.request) {
    return "Backend se response nahi mila. Backend status, API base URL aur network check karo.";
  }

  return err.message || "Request complete nahi hui.";
}

export default function CreateTicket() {
  const navigate = useNavigate();

  const [category, setCategory] = useState("General Inquiry");
  const [book, setBook] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);

  const [books, setBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [booksError, setBooksError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchBooks() {
      setLoadingBooks(true);
      setBooksError("");

      try {
        // api baseURL should include /api; book router mounted at /api/book.
        const response = await api.get<ApiResponse<Book[]>>("/book/get-books");

        if (!response.data.success) {
          throw new Error(response.data.message || "Books load nahi hui.");
        }

        if (isMounted) {
          setBooks(Array.isArray(response.data.data) ? response.data.data : []);
        }
      } catch (error) {
        if (isMounted) setBooksError(getErrorMessage(error));
      } finally {
        if (isMounted) setLoadingBooks(false);
      }
    }

    void fetchBooks();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    setSubmitError("");
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setAttachment(null);
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setAttachment(null);
      event.target.value = "";
      setSubmitError("PDF, PNG, JPG, JPEG, DOC ya DOCX file select karo.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setAttachment(null);
      event.target.value = "";
      setSubmitError("Attachment ka size maximum 5 MB hona chahiye.");
      return;
    }

    setAttachment(file);
  }

  function removeAttachment() {
    setAttachment(null);

    const input = document.getElementById(
      "attachment",
    ) as HTMLInputElement | null;

    if (input) input.value = "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitError("");

    const cleanSubject = subject.trim();
    const cleanDescription = description.trim();

    if (!cleanSubject) {
      setSubmitError("Subject enter karo.");
      return;
    }

    if (cleanSubject.length > 200) {
      setSubmitError("Subject maximum 200 characters ka ho sakta hai.");
      return;
    }

    if (cleanDescription.length < 10) {
      setSubmitError("Description minimum 10 characters ka hona chahiye.");
      return;
    }

    if (cleanDescription.length > 10000) {
      setSubmitError("Description maximum 10,000 characters ka ho sakta hai.");
      return;
    }

    const selectedBook = books.find(
      (item) => item.bookId === book || item._id === book,
    );

    // Backend ticket controller expects the business ID, e.g. BK001.
    if (book && !selectedBook) {
      setSubmitError(
        "Selected book nahi mili. Books list refresh karke try karo.",
      );
      return;
    }

    if (book && !selectedBook?.bookId) {
      setSubmitError(
        "Book API response mein business bookId nahi mila. Backend book response mein bookId field include karo.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("subject", cleanSubject);
      formData.append("description", cleanDescription);

      if (selectedBook?.bookId) {
        formData.append("bookId", selectedBook.bookId);
      }

      if (attachment) {
        formData.append("attachment", attachment);
      }

      // Axios/browser will set the multipart boundary automatically.
      const response = await api.post<ApiResponse<unknown>>(
        "/ticket",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // 👈 Force override
          },
        },
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Ticket create nahi hua.");
      }

      navigate("/author/tickets", {
        state: {
          successMessage:
            response.data.message || "Support ticket successfully created.",
        },
      });
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
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
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="form-grid">
              <div className="field">
                <label htmlFor="category">Issue category</label>
                <select
                  id="category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  disabled={submitting}
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="book">Related book (optional)</label>
                <select
                  id="book"
                  value={book}
                  onChange={(event) => setBook(event.target.value)}
                  disabled={loadingBooks || !!booksError || submitting}
                >
                  <option value="">General / account issue</option>

                  {books.map((item) => (
                    <option key={item._id} value={item.bookId || item._id}>
                      {item.title}
                    </option>
                  ))}
                </select>

                {loadingBooks && (
                  <small className="muted">Loading your books...</small>
                )}

                {booksError && (
                  <div role="alert">
                    <small className="muted">{booksError}</small>
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => window.location.reload()}
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>

              <div className="field full-width">
                <label htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  required
                  maxLength={200}
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Briefly describe your issue"
                  disabled={submitting}
                />
              </div>

              <div className="field full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  required
                  minLength={10}
                  maxLength={10000}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Include relevant details so we can help you..."
                  disabled={submitting}
                />
              </div>

              <div className="field full-width">
                <label htmlFor="attachment">Attachment (optional)</label>
                <input
                  id="attachment"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={handleAttachmentChange}
                  disabled={submitting}
                />

                <small className="muted">
                  {attachment
                    ? `Selected: ${attachment.name} (${(
                        attachment.size / 1024
                      ).toFixed(1)} KB)`
                    : "PDF, images or documents. Maximum size: 5 MB."}
                </small>

                {attachment && (
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={removeAttachment}
                    disabled={submitting}
                  >
                    Remove attachment
                  </button>
                )}
              </div>
            </div>

            {submitError && (
              <p className="form-error" role="alert">
                {submitError}
              </p>
            )}

            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 22,
                flexWrap: "wrap",
              }}
            >
              <button
                className="primary-btn"
                type="submit"
                disabled={submitting || loadingBooks}
              >
                {submitting ? "Submitting..." : "Submit ticket"}
              </button>

              <button
                className="secondary-btn"
                type="button"
                onClick={() => navigate("/author/tickets")}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      </main>
    </DashboardLayout>
  );
}
