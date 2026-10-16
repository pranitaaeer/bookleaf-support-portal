
import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CircleDollarSign,
  Clock3,
  Headset,
  Plus,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

type BookItem = {
  _id: string;
  bookId?: string;
  title: string;
  isbn?: string;
  genre?: string;
  publicationDate?: string;
  status: string;
  mrp?: number;
  totalCopiesSold?: number;
  totalRoyaltyEarned?: number;
  royaltyPaid?: number;
  royaltyPending?: number;
};

type TicketItem = {
  _id: string;
  subject: string;
  category?: string;
  priority?: string;
  status: string;
  updatedAt?: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
};

const currency = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);

const statusClass: Record<string, string> = {
  Published: "published",
  "In Production": "production",
  "In Production - Cover Design": "production",
  "In Production - Typesetting": "production",
  "Under Review": "review",
  Open: "open",
  "In Progress": "progress",
  Resolved: "resolved",
  Closed: "closed",
};

const priorityClass: Record<string, string> = {
  Critical: "critical",
  High: "high",
  Medium: "medium",
  Low: "low",
};

const formatDate = (value?: string) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getErrorMessage = (error: unknown) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const apiError = error as {
      response?: {
        data?: {
          message?: string;
        };
      };
    };

    return (
      apiError.response?.data?.message ||
      "Unable to load dashboard data."
    );
  }

  return "Unable to connect to the server.";
};

export default function AuthorDashboard() {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setLoadError("");

      try {
        const [booksResponse, ticketsResponse] = await Promise.all([
          api.get<ApiResponse<BookItem[]>>("/book/get-books"),
          api.get<ApiResponse<TicketItem[]>>("/ticket/my-tickets"),
        ]);

        if (!active) return;

        setBooks(
          Array.isArray(booksResponse.data.data)
            ? booksResponse.data.data
            : []
        );

        setTickets(
          Array.isArray(ticketsResponse.data.data)
            ? ticketsResponse.data.data
            : []
        );
      } catch (error: unknown) {
        if (!active) return;

        const message = getErrorMessage(error);
        setLoadError(message);
        toast.error(message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const totalBooks = books.length;

  const publishedBooks = books.filter(
    (book) => book.status === "Published"
  ).length;

  const totalEarned = books.reduce(
    (sum, book) => sum + (Number(book.totalRoyaltyEarned) || 0),
    0
  );

  const royaltyPaid = books.reduce(
    (sum, book) => sum + (Number(book.royaltyPaid) || 0),
    0
  );

  const royaltyPending = books.reduce(
    (sum, book) => sum + (Number(book.royaltyPending) || 0),
    0
  );

  const totalCopiesSold = books.reduce(
    (sum, book) => sum + (Number(book.totalCopiesSold) || 0),
    0
  );

  const paidPercent =
    totalEarned > 0
      ? Math.min(100, Math.round((royaltyPaid / totalEarned) * 100))
      : 0;

  const pendingPercent =
    totalEarned > 0
      ? Math.min(100, Math.round((royaltyPending / totalEarned) * 100))
      : 0;

  const stats = [
    {
      title: "Total books",
      value: totalBooks.toString(),
      note: `${publishedBooks} currently published`,
      icon: BookOpen,
      tone: "green",
      trend: "up",
    },
    {
      title: "Total royalty earned",
      value: currency(totalEarned),
      note: "Lifetime earnings",
      icon: CircleDollarSign,
      tone: "blue",
      trend: "up",
    },
    {
      title: "Royalty paid",
      value: currency(royaltyPaid),
      note: "Payments received",
      icon: Wallet,
      tone: "purple",
      trend: "up",
    },
    {
      title: "Royalty pending",
      value: currency(royaltyPending),
      note: "Awaiting payment",
      icon: Clock3,
      tone: "orange",
      trend: "down",
    },
  ];

  return (
    <DashboardLayout>
      <div className="dashboard">
        <section className="welcome">
          <div>
            <div className="eyebrow">
              <span className="live-dot" />
              YOUR PUBLISHING SPACE
            </div>

            <h1>
              Good afternoon, <span>Author.</span>
            </h1>

            <p>
              Here&apos;s what&apos;s happening with your books and royalties.
            </p>
          </div>

          <Link
            className="button button--primary"
            to="/author/tickets/new"
          >
            <Plus size={18} />
            Raise a ticket
          </Link>
        </section>

        {loadError && (
          <div className="portal-alert portal-alert--error" role="alert">
            {loadError}
          </div>
        )}

        <section className="stats-grid" aria-label="Author statistics">
          {stats.map(
            ({ title, value, note, icon: Icon, tone, trend }) => (
              <article
                className={`stat-card author-stat-card ${tone}`}
                key={title}
              >
                <div className="stat-card__top">
                  <span className={`stat-card__icon stat-card__icon--${tone}`}>
                    <Icon size={20} />
                  </span>

                  <span className="stat-card__period">ALL TIME</span>
                </div>

                <p className="stat-card__title">{title}</p>
                <h2>{loading ? "—" : value}</h2>

                <div className="stat-card__footer">
                  {trend === "up" ? (
                    <ArrowUpRight size={15} />
                  ) : (
                    <ArrowDownRight size={15} />
                  )}
                  <span>{loading ? "Loading..." : note}</span>
                </div>
              </article>
            )
          )}
        </section>

        <section className="dashboard-grid">
          <article className="panel books-panel">
            <div className="panel__header">
              <div>
                <div className="panel__title-row">
                  <BookOpen size={18} />
                  <h2>Your books</h2>
                </div>
                <p>Track your published titles and performance.</p>
              </div>

              <Link className="text-link" to="/author/books">
                View all <ArrowRight size={15} />
              </Link>
            </div>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>BOOK TITLE</th>
                    <th>STATUS</th>
                    <th>COPIES SOLD</th>
                    <th>ROYALTY EARNED</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4}>Loading your books...</td>
                    </tr>
                  ) : books.length === 0 ? (
                    <tr>
                      <td colSpan={4}>No books found in your account.</td>
                    </tr>
                  ) : (
                    books.slice(0, 5).map((book) => (
                      <tr key={book._id}>
                        <td>
                          <div className="book-cell">
                            <div className="book-cell__cover">
                              <BookOpen size={18} />
                            </div>
                            <div>
                              <strong>{book.title}</strong>
                              <span>
                                {book.bookId || book.isbn || "Book"} ·{" "}
                                {book.genre || "General"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`status-badge status-badge--${
                              statusClass[book.status] || "open"
                            }`}
                          >
                            <span />
                            {book.status}
                          </span>
                        </td>

                        <td className="table-number">
                          {(Number(book.totalCopiesSold) || 0).toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        <td className="table-number table-number--strong">
                          {currency(Number(book.totalRoyaltyEarned) || 0)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="panel__footer">
              <span>
                {loading ? "Loading..." : `Showing ${Math.min(books.length, 5)} of ${books.length} books`}
              </span>
              <Link to="/author/books">
                Explore your library <ArrowRight size={15} />
              </Link>
            </div>
          </article>

          <article className="panel royalty-panel">
            <div className="panel__header">
              <div>
                <div className="panel__title-row">
                  <Wallet size={18} />
                  <h2>Royalty overview</h2>
                </div>
                <p>Your earnings at a glance.</p>
              </div>
            </div>

            <div className="royalty-total">
              <span>Total earned</span>
              <h2>{loading ? "—" : currency(totalEarned)}</h2>
              <span className="royalty-total__caption">
                Across all your titles
              </span>
            </div>

            <div className="royalty-breakdown">
              <div className="royalty-row">
                <div>
                  <span className="royalty-dot royalty-dot--paid" />
                  <span>Paid to you</span>
                </div>
                <div className="royalty-row__value">
                  <strong>{loading ? "—" : currency(royaltyPaid)}</strong>
                  <span className="royalty-row__percent">
                    {loading ? "—" : `${paidPercent}%`}
                  </span>
                </div>
              </div>

              <div className="royalty-bar">
                <span
                  className="royalty-bar__paid"
                  style={{ width: `${loading ? 0 : paidPercent}%` }}
                />
              </div>

              <div className="royalty-row">
                <div>
                  <span className="royalty-dot royalty-dot--pending" />
                  <span>Pending</span>
                </div>
                <div className="royalty-row__value">
                  <strong>{loading ? "—" : currency(royaltyPending)}</strong>
                  <span className="royalty-row__percent">
                    {loading ? "—" : `${pendingPercent}%`}
                  </span>
                </div>
              </div>

              <div className="royalty-bar">
                <span
                  className="royalty-bar__pending"
                  style={{ width: `${loading ? 0 : pendingPercent}%` }}
                />
              </div>
            </div>

            <div className="royalty-note">
              <Clock3 size={17} />
              <p>
                Pending royalty is displayed for your reference. Check the
                relevant book details for more information.
              </p>
            </div>
          </article>
        </section>

        <section className="panel tickets-panel">
          <div className="panel__header">
            <div>
              <div className="panel__title-row">
                <Headset size={18} />
                <h2>Recent support tickets</h2>
              </div>
              <p>Stay updated on your conversations with BookLeaf support.</p>
            </div>

            <Link className="text-link" to="/author/tickets">
              View all <ArrowRight size={15} />
            </Link>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>TICKET</th>
                  <th>CATEGORY</th>
                  <th>PRIORITY</th>
                  <th>STATUS</th>
                  <th>LAST UPDATED</th>
                  <th style={{ textAlign: "right" }}>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6}>Loading your tickets...</td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      No support tickets yet. You can raise a ticket if you
                      need help.
                    </td>
                  </tr>
                ) : (
                  tickets.slice(0, 5).map((ticket) => (
                    <tr key={ticket._id}>
                      <td>
                        <div className="ticket-cell">
                          <strong>{ticket.subject}</strong>
                          <span>{ticket._id}</span>
                        </div>
                      </td>

                      <td className="muted-cell">
                        {ticket.category || "General Inquiry"}
                      </td>

                      <td>
                        <span
                          className={`priority-badge priority-badge--${
                            priorityClass[ticket.priority || "Medium"] ||
                            "medium"
                          }`}
                        >
                          {ticket.priority || "Medium"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status-badge status-badge--${
                            statusClass[ticket.status] || "open"
                          }`}
                        >
                          <span />
                          {ticket.status}
                        </span>
                      </td>

                      <td className="muted-cell">
                        {formatDate(ticket.updatedAt)}
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <Link
                          to={`/author/tickets/${ticket._id}`}
                          className="review-btn"
                          aria-label={`View ${ticket.subject}`}
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="dashboard-bottom">
          <div className="bottom-stat">
            <div className="bottom-stat__icon">
              <ShoppingBag size={20} />
            </div>
            <div>
              <span>Total copies sold</span>
              <strong>
                {loading ? "—" : totalCopiesSold.toLocaleString("en-IN")}
              </strong>
            </div>
          </div>

          <div className="bottom-stat__message">
            <span className="live-dot" />
            Your author workspace is ready
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
