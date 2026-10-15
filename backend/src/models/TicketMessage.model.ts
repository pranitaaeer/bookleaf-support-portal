
import { Schema, model } from "mongoose";

const ticketMessageSchema = new Schema(
  {
    ticket: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
      index: true,
    },
    senderRole: {
      type: String,
      enum: ["author", "admin"],
      required: true,
    },
    senderAuthor: {
      type: Schema.Types.ObjectId,
      ref: "Author",
      default: null,
    },
    senderAdminId: {
      type: String,
      default: null,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },
    isInternal: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

ticketMessageSchema.index({ ticket: 1, createdAt: 1 });

export default model("TicketMessage", ticketMessageSchema);
