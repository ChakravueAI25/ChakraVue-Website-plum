import mongoose from "mongoose";

/**
 * The backend's only two collections: `enquiries` (every public form) and
 * `admins` (who may read them). Collection names are fixed so Mongoose never
 * pluralises its own.
 */

// Query filters built from user input are sanitised ($-operators stripped).
mongoose.set("sanitizeFilter", true);
mongoose.set("strictQuery", true);

export const STATUSES = ["new", "contacted", "closed"] as const;
export type Status = (typeof STATUSES)[number];

/** What a submission is about. The forms pick one; the server accepts only these. */
export const ENQUIRY_TYPES = [
  "general",
  "product",
  "demo",
  "early-access",
  "collaboration",
  "distribution",
  "oem",
  "investment",
] as const;

/** Which form sent it. */
export const SOURCE_FORMS = ["contact-page", "contact-popup", "try-demo-request", "early-bird-offer"] as const;

const optional = (max: number) => ({ type: String, trim: true, maxlength: max, default: undefined });

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 140 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    phone: optional(32),
    organization: optional(200),
    designation: optional(120),
    visitorType: optional(120),
    productInterest: { type: [{ type: String, trim: true, maxlength: 120 }], default: undefined },
    enquiryType: { type: String, required: true, enum: ENQUIRY_TYPES },
    message: optional(3000),
    referralSource: optional(60),
    demoOfferInterest: optional(120),
    sourceForm: { type: String, required: true, enum: SOURCE_FORMS },
    sourcePage: optional(200),
    // Extra fields some forms collect, kept rather than discarded.
    country: optional(100),
    department: optional(120),
    audience: optional(120),
    contactMethod: optional(40),
    timeline: optional(60),
    consent: { type: Boolean, default: undefined },
    status: { type: String, enum: STATUSES, default: "new" },
  },
  { collection: "enquiries", timestamps: true, versionKey: false },
);

enquirySchema.index({ createdAt: -1 });
enquirySchema.index({ email: 1 });
enquirySchema.index({ status: 1, createdAt: -1 });

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, default: "admin", enum: ["admin"] },
    isActive: { type: Boolean, default: true },
  },
  { collection: "admins", timestamps: true, versionKey: false },
);

adminSchema.index({ email: 1 }, { unique: true });

export const Enquiry = mongoose.models.Enquiry ?? mongoose.model("Enquiry", enquirySchema);
export const Admin = mongoose.models.Admin ?? mongoose.model("Admin", adminSchema);
