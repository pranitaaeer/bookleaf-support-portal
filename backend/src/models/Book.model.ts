
import { Schema, model } from "mongoose";

const bookSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "Author",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    isbn: {
      type: String,
      trim: true,
    },
    genre: {
      type: String,
      trim: true,
    },
    publicationDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "Manuscript Received",
        "Editing",
        "Cover Design",
        "Typesetting",
        "Proofreading",
        "ISBN Assignment",
        "Printing",
        "Distribution Setup",
        "Published & Live",
      ],
    },
    mrp: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalCopiesSold: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalRoyaltyEarned: {
      type: Number,
      min: 0,
      default: 0,
    },
    royaltyPaid: {
      type: Number,
      min: 0,
      default: 0,
    },
    royaltyPending: {
      type: Number,
      min: 0,
      default: 0,
    },
    distributionDetails: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

bookSchema.index({ author: 1, status: 1 });

export default model("Book", bookSchema);
