export interface Book {
  id: string;
  title: string;
  genre: string;
  status: "Published" | "In Production" | "Under Review";
  copiesSold: number;
  royaltyEarned: number;
  royaltyPending: number;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  priority: "Critical" | "High" | "Medium" | "Low";
  updatedAt: string;
}

export const dashboardStats = {
  totalBooks: 6,
  publishedBooks: 4,
  totalEarned: 48500,
  royaltyPaid: 32000,
  royaltyPending: 16500,
  totalCopiesSold: 1240,
};

export const books: Book[] = [
  {
    id: "BK001",
    title: "The Art of Starting Over",
    genre: "Self-Help",
    status: "Published",
    copiesSold: 420,
    royaltyEarned: 16800,
    royaltyPending: 4800,
  },
  {
    id: "BK002",
    title: "Whispers of the Monsoon",
    genre: "Fiction",
    status: "Published",
    copiesSold: 315,
    royaltyEarned: 12600,
    royaltyPending: 3600,
  },
  {
    id: "BK003",
    title: "The Quiet Revolution",
    genre: "Non-Fiction",
    status: "Published",
    copiesSold: 280,
    royaltyEarned: 11200,
    royaltyPending: 4200,
  },
  {
    id: "BK004",
    title: "Letters to My Younger Self",
    genre: "Memoir",
    status: "In Production",
    copiesSold: 0,
    royaltyEarned: 0,
    royaltyPending: 0,
  },
];

export const tickets: SupportTicket[] = [
  {
    id: "TKT-1024",
    subject: "Pending royalty payment",
    category: "Royalty & Payments",
    status: "In Progress",
    priority: "High",
    updatedAt: "2 hours ago",
  },
  {
    id: "TKT-1021",
    subject: "ISBN correction request",
    category: "ISBN & Metadata Issues",
    status: "Open",
    priority: "Medium",
    updatedAt: "Yesterday",
  },
  {
    id: "TKT-1018",
    subject: "Book distribution update",
    category: "Distribution & Availability",
    status: "Resolved",
    priority: "Low",
    updatedAt: "3 days ago",
  },
];