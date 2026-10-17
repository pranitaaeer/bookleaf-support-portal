
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

interface BookItem {
  _id: string;
  bookId?: string;
  title: string;
  genre?: string;
  isbn?: string | null;
  publicationDate?: string | null;
  status: string;
  mrp?: number | null;
  totalCopiesSold?: number;
  totalRoyaltyEarned?: number;
  royaltyPaid?: number;
  royaltyPending?: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
}

export default function MyBooks() {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get<ApiResponse<BookItem[]>>(
          "/book/get-books"
        );

        if (!response.data.success) {
          throw new Error(response.data.message || "Unable to fetch books.");
        }

        setBooks(response.data.data ?? []);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Unable to load your books. Please try again.";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void fetchBooks();
  }, []);

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return books.filter((book) => {
      const matchesSearch =
        !query ||
        book.title.toLowerCase().includes(query) ||
        (book.isbn ?? "").toLowerCase().includes(query) ||
        (book.bookId ?? "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        book.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [books, search, statusFilter]);

  const formatDate = (date?: string | null) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount?: number | null) => {
    if (amount == null) return "—";

    return `₹${amount.toLocaleString("en-IN")}`;
  };

  return (
    <DashboardLayout>
      <main className="portal-page">
        <div className="page-heading">
          <div>
            <h1>My Books</h1>
            <p>Track your publications, sales, and royalty earnings.</p>
          </div>
        </div>

        <section className="panel">
          <div className="toolbar">
            <input
              aria-label="Search books"
              placeholder="Search by title, ISBN, or book ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="Published">Published</option>
              <option value="In Production">In Production</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          {loading ? (
            <p className="muted">Loading your books...</p>
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
          ) : filteredBooks.length === 0 ? (
            <p className="muted">
              {books.length === 0
                ? "You haven't added any books yet."
                : "No books match your search or selected status."}
            </p>
          ) : (
            <div className="table-wrap">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Genre</th>
                    <th>ISBN</th>
                    <th>Published</th>
                    <th>Status</th>
                    <th>MRP</th>
                    <th>Copies sold</th>
                    <th>Royalty earned</th>
                    <th>Paid</th>
                    <th>Pending</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBooks.map((book) => (
                    <tr key={book._id}>
                      <td>
                        <Link to={`/author/books/${book.bookId ?? book._id}`}>
                          {book.title}
                        </Link>
                      </td>
                      <td>{book.genre || "—"}</td>
                      <td>{book.isbn || "—"}</td>
                      <td>{formatDate(book.publicationDate)}</td>
                      <td>
                        <span className="status-pill">{book.status}</span>
                      </td>
                      <td>{formatCurrency(book.mrp)}</td>
                      <td>
                        {(book.totalCopiesSold ?? 0).toLocaleString("en-IN")}
                      </td>
                      <td>
                        {formatCurrency(book.totalRoyaltyEarned ?? 0)}
                      </td>
                      <td>{formatCurrency(book.royaltyPaid ?? 0)}</td>
                      <td>{formatCurrency(book.royaltyPending ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && (
            <p className="muted">
              Showing {filteredBooks.length} of {books.length} books.
            </p>
          )}

          <Link className="secondary-btn" to="/author/tickets/new">
            Need help with a book?
          </Link>
        </section>
      </main>
    </DashboardLayout>
  );
}

