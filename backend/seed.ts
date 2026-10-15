
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { readFile } from "node:fs/promises";
import Author from "./src/models/Author.model.js";
import Book from "./src/models/Book.model.js";

declare const process: {
  env: Record<string, string | undefined>;
  exitCode?: number;
};

type SampleBook = {
  book_id: string;
  title: string;
  isbn?: string | null;
  genre?: string | null;
  publication_date?: string | null;
  status: string;
  mrp?: number;
  author_royalty_per_copy?: number | null;
  total_copies_sold?: number;
  total_royalty_earned?: number;
  royalty_paid?: number;
  royalty_pending?: number;
  last_royalty_payout_date?: string | null;
  print_partner?: string | null;
  available_on?: string[];
};

type SampleAuthor = {
  author_id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  joined_date?: string | null;
  books: SampleBook[];
};

async function seedDatabase() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.DB_NAME;
  const seedPassword = process.env.SEED_AUTHOR_PASSWORD;

  if (!uri) throw new Error("MONGO_URI is missing in .env");
  if (!seedPassword) {
    throw new Error("SEED_AUTHOR_PASSWORD is missing in .env");
  }

  const connectOptions = dbName ? { dbName } : {};
  await mongoose.connect(
    uri,
    connectOptions as Parameters<typeof mongoose.connect>[1]
  );

  try {
    const fileUrl = new URL("./data/bookleaf_sample_data.json", import.meta.url);
    const rawData = await readFile(fileUrl, "utf8");
    const data = JSON.parse(rawData) as { authors: SampleAuthor[] };

    if (!Array.isArray(data.authors)) {
      throw new Error("JSON must contain an authors array");
    }

    const passwordHash = await bcrypt.hash(seedPassword, 12);
    let authorsProcessed = 0;
    let booksProcessed = 0;

    for (const item of data.authors) {
      const author = await Author.findOneAndUpdate(
        { authorId: item.author_id },
        {
          $set: {
            name: item.name,
            email: item.email,
            phone: item.phone ?? "",
            city: item.city ?? "",
            joinedDate: item.joined_date
              ? new Date(item.joined_date)
              : null,
            isActive: true,
          },
          $setOnInsert: {
            authorId: item.author_id,
            passwordHash,
          },
        },
        { upsert: true, new: true, runValidators: true }
      );

      authorsProcessed++;

      for (const b of item.books ?? []) {
        await Book.findOneAndUpdate(
          { bookId: b.book_id },
          {
            $set: {
              author: author._id,
              title: b.title,
              isbn: b.isbn ?? "",
              genre: b.genre ?? "",
              publicationDate: b.publication_date
                ? new Date(b.publication_date)
                : null,
              status: b.status,
              mrp: b.mrp ?? 0,
              authorRoyaltyPerCopy: b.author_royalty_per_copy ?? null,
              totalCopiesSold: b.total_copies_sold ?? 0,
              totalRoyaltyEarned: b.total_royalty_earned ?? 0,
              royaltyPaid: b.royalty_paid ?? 0,
              royaltyPending: b.royalty_pending ?? 0,
              lastRoyaltyPayoutDate: b.last_royalty_payout_date
                ? new Date(b.last_royalty_payout_date)
                : null,
              printPartner: b.print_partner ?? null,
              availableOn: b.available_on ?? [],
            },
            $setOnInsert: {
              bookId: b.book_id,
            },
          },
          { upsert: true, runValidators: true }
        );

        booksProcessed++;
      }
    }

    console.log("Seed completed successfully.");
    console.log(`Authors processed: ${authorsProcessed}`);
    console.log(`Books processed: ${booksProcessed}`);
    console.log("Collections: authors and books");
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase().catch((error) => {
  console.error("Seed failed:", error);
  process.exitCode = 1;
});
