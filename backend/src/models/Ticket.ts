
import { Schema, model } from "mongoose";

export const TICKET_CATEGORIES = [
  "Royalty & Payments",
  "ISBN & Metadata Issues",
  "Printing & Quality",
  "Distribution & Availability",
  "Book Status & Production Updates",
  "General Inquiry",
] as const;

export const TICKET_PRIORITIES = [
  "Critical",
  "High",
  "Medium",
  "Low",
] as const;

export const TICKET_STATUSES = [
  "Open",
  "In Progress",
  "Resolved",
  "Closed",
] as const;

const ticketSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "Author",
      required: true,
      index: true,
    },
    book: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      default: null,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },
    attachmentName: {
      type: String,
      default: null,
    },

    category: {
      type: String,
      enum: TICKET_CATEGORIES,
      default: "General Inquiry",
    },
    aiSuggestedCategory: {
      type: String,
      enum: TICKET_CATEGORIES,
      default: null,
    },
    categoryOverridden: {
      type: Boolean,
      default: false,
    },

    priority: {
      type: String,
      enum: TICKET_PRIORITIES,
      default: "Medium",
    },
    aiSuggestedPriority: {
      type: String,
      enum: TICKET_PRIORITIES,
      default: null,
    },
    priorityOverridden: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: TICKET_STATUSES,
      default: "Open",
      index: true,
    },
    assignedAdmin: {
      type: String,
      default: null,
    },
    internalNotes: [
      {
        adminId: {
          type: String,
          required: true,
        },
        note: {
          type: String,
          required: true,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    aiDraftResponse: {
      type: String,
      default: "",
    },
    aiDraftGeneratedAt: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

ticketSchema.index({ status: 1, priority: 1, createdAt: 1 });
ticketSchema.index({ category: 1, createdAt: -1 });

export default model("Ticket", ticketSchema);
