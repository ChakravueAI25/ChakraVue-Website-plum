/**
 * The admin dashboard's calls to the server. The session is an HTTP-only
 * cookie the page never sees; nothing is kept in local storage. Every call
 * carries the header the server requires on admin requests.
 */

export type Status = "new" | "contacted" | "closed";

export type EnquiryRow = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  visitorType?: string;
  productInterest?: string[];
  enquiryType: string;
  sourceForm: string;
  status: Status;
  createdAt: string;
};

export type Enquiry = EnquiryRow & {
  designation?: string;
  message?: string;
  referralSource?: string;
  demoOfferInterest?: string;
  sourcePage?: string;
  country?: string;
  department?: string;
  audience?: string;
  contactMethod?: string;
  timeline?: string;
  consent?: boolean;
  updatedAt: string;
};

export type AdminUser = { id: string; name: string; email: string; role: string };

export type Dashboard = { total: number; new: number; contacted: number; closed: number; recent: EnquiryRow[]; products: string[] };

export type Page = { items: EnquiryRow[]; page: number; limit: number; total: number; pages: number };

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      credentials: "same-origin",
      headers: { "X-Requested-With": "chakravue-admin", ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers },
    });
  } catch {
    throw new ApiError(0, "Couldn't reach the server. Check your connection.");
  }
  const body = (await response.json().catch(() => null)) as { ok: boolean; data?: T; error?: { message: string } } | null;
  if (response.ok && body?.ok) return body.data as T;
  throw new ApiError(response.status, body?.error?.message ?? "Something went wrong. Please try again.");
}

export const api = {
  me: () => call<{ admin: AdminUser }>("/api/admin/me"),
  login: (email: string, password: string) => call<{ admin: AdminUser }>("/api/admin/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => call<{ signedOut: true }>("/api/admin/logout", { method: "POST" }),
  dashboard: () => call<Dashboard>("/api/admin/dashboard"),
  list: (params: URLSearchParams) => call<Page>(`/api/admin/enquiries?${params}`),
  get: (id: string) => call<{ enquiry: Enquiry }>(`/api/admin/enquiries/${encodeURIComponent(id)}`),
  setStatus: (id: string, status: Status) =>
    call<{ enquiry: Enquiry }>(`/api/admin/enquiries/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
};
