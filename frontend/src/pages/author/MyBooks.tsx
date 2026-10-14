
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
// import { books } from "../../data/dashboardData";

export default function MyBooks() {
    const books = [
  {
    id: "BK001",
    title: "The Art of Starting Over",
    genre: "Self-Help",
    isbn: "9780000001001",
    publicationDate: "15 Jun 2026",
    status: "Published",
    mrp: 399,
    copiesSold: 420,
    royaltyEarned: 16800,
    royaltyPaid: 12000,
    royaltyPending: 4800,
  },
  {
    id: "BK002",
    title: "Whispers of the Monsoon",
    genre: "Fiction",
    isbn: "9780000001002",
    publicationDate: "20 Jul 2026",
    status: "Published",
    mrp: 299,
    copiesSold: 315,
    royaltyEarned: 12600,
    royaltyPaid: 9000,
    royaltyPending: 3600,
  },
  {
    id: "BK003",
    title: "The Quiet Revolution",
    genre: "Non-Fiction",
    isbn: "9780000001003",
    publicationDate: "05 Aug 2026",
    status: "Published",
    mrp: 349,
    copiesSold: 280,
    royaltyEarned: 11200,
    royaltyPaid: 7000,
    royaltyPending: 4200,
  },
  {
    id: "BK004",
    title: "Letters to My Younger Self",
    genre: "Memoir",
    isbn: null,
    publicationDate: null,
    status: "In Production",
    mrp: null,
    copiesSold: 0,
    royaltyEarned: 0,
    royaltyPaid: 0,
    royaltyPending: 0,
  },
];
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
            <input aria-label="Search books" placeholder="Search by title or ISBN..." />
            <select aria-label="Filter by status" defaultValue="all">
              <option value="all">All statuses</option>
              <option value="Published">Published</option>
              <option value="In Production">In Production</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

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
                {books.map((book) => (
                  <tr key={book.id}>
                    <td>{book.title}</td>
                    <td>{book.genre}</td>
                    <td>{book.isbn ?? "—"}</td>
                    <td>{book.publicationDate ?? "—"}</td>
                    <td><span className="status-pill">{book.status}</span></td>
                    <td>{book.mrp == null ? "—" : `₹${book.mrp}`}</td>
                    <td>{book.copiesSold.toLocaleString("en-IN")}</td>
                    <td>₹{book.royaltyEarned.toLocaleString("en-IN")}</td>
                    <td>₹{book.royaltyPaid.toLocaleString("en-IN")}</td>
                    <td>₹{book.royaltyPending.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted">Showing demo data. Book details will come from the API later.</p>
          <Link className="secondary-btn" to="/author/tickets/new">Need help with a book?</Link>
        </section>
      </main>
    </DashboardLayout>
  );
}
