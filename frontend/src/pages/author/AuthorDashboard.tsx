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

import DashboardLayout from "../../components/layout/DashboardLayout";
import { books, dashboardStats, tickets } from "../../data/dashboardData";

const currency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const statusClass: Record<string, string> = {
  Published: "published",
  "In Production": "production",
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

export default function AuthorDashboard() {
  const stats = [
    {
      title: "Total books",
      value: dashboardStats.totalBooks.toString(),
      note: `${dashboardStats.publishedBooks} currently published`,
      icon: BookOpen,
      tone: "green",
      trend: "up",
    },
    {
      title: "Total royalty earned",
      value: currency(dashboardStats.totalEarned),
      note: "Lifetime earnings",
      icon: CircleDollarSign,
      tone: "blue",
      trend: "up",
    },
    {
      title: "Royalty paid",
      value: currency(dashboardStats.royaltyPaid),
      note: "Payments received",
      icon: Wallet,
      tone: "purple",
      trend: "up",
    },
    {
      title: "Royalty pending",
      value: currency(dashboardStats.royaltyPending),
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
              Good afternoon, <span>Pranita.</span>
            </h1>

            <p>
              Here&apos;s what&apos;s happening with your books and royalties.
            </p>
          </div>

          <a className="button button--primary" href="/author/tickets/new">
            <Plus size={18} />
            Raise a ticket
          </a>
        </section>

        <section className="stats-grid" aria-label="Author statistics">
          {stats.map(({ title, value, note, icon: Icon, tone, trend }) => (
            <article className="stat-card" key={title}>
              <div className="stat-card__top">
                <span className={`stat-card__icon stat-card__icon--${tone}`}>
                  <Icon size={20} />
                </span>

                <span className="stat-card__period">ALL TIME</span>
              </div>

              <p className="stat-card__title">{title}</p>
              <h2>{value}</h2>

              <div className="stat-card__footer">
                {trend === "up" ? (
                  <ArrowUpRight size={15} />
                ) : (
                  <ArrowDownRight size={15} />
                )}
                <span>{note}</span>
              </div>
            </article>
          ))}
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

              <a className="text-link" href="/author/books">
                View all <ArrowRight size={15} />
              </a>
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
                  {books.map((book) => (
                    <tr key={book.id}>
                      <td>
                        <div className="book-cell">
                          <div className="book-cell__cover">
                            <BookOpen size={18} />
                          </div>
                          <div>
                            <strong>{book.title}</strong>
                            <span>{book.id} · {book.genre}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`status-badge status-badge--${statusClass[book.status]}`}
                        >
                          <span />
                          {book.status}
                        </span>
                      </td>

                      <td className="table-number">
                        {book.copiesSold.toLocaleString("en-IN")}
                      </td>

                      <td className="table-number table-number--strong">
                        {currency(book.royaltyEarned)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="panel__footer">
              <span>Showing {books.length} sample titles</span>
              <a href="/author/books">
                Explore your library <ArrowRight size={15} />
              </a>
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
              <h2>{currency(dashboardStats.totalEarned)}</h2>
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
                <strong>{currency(dashboardStats.royaltyPaid)}</strong>
              </div>

              <div className="royalty-bar">
                <span
                  className="royalty-bar__paid"
                  style={{
                    width: `${
                      (dashboardStats.royaltyPaid /
                        dashboardStats.totalEarned) *
                      100
                    }%`,
                  }}
                />
              </div>

              <div className="royalty-row">
                <div>
                  <span className="royalty-dot royalty-dot--pending" />
                  <span>Pending</span>
                </div>
                <strong>{currency(dashboardStats.royaltyPending)}</strong>
              </div>

              <div className="royalty-bar">
                <span
                  className="royalty-bar__pending"
                  style={{
                    width: `${
                      (dashboardStats.royaltyPending /
                        dashboardStats.totalEarned) *
                      100
                    }%`,
                  }}
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

            <a className="text-link" href="/author/tickets">
              View all <ArrowRight size={15} />
            </a>
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
                  <th />
                </tr>
              </thead>

              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>
                      <div className="ticket-cell">
                        <strong>{ticket.subject}</strong>
                        <span>{ticket.id}</span>
                      </div>
                    </td>

                    <td className="muted-cell">{ticket.category}</td>

                    <td>
                      <span
                        className={`priority-badge priority-badge--${priorityClass[ticket.priority]}`}
                      >
                        {ticket.priority}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`status-badge status-badge--${statusClass[ticket.status]}`}
                      >
                        <span />
                        {ticket.status}
                      </span>
                    </td>

                    <td className="muted-cell">{ticket.updatedAt}</td>

                    <td>
                      <a
                        className="row-action"
                        href={`/author/tickets/${ticket.id}`}
                        aria-label={`View ${ticket.subject}`}
                      >
                        <ArrowRight size={17} />
                      </a>
                    </td>
                  </tr>
                ))}
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
                {dashboardStats.totalCopiesSold.toLocaleString("en-IN")}
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