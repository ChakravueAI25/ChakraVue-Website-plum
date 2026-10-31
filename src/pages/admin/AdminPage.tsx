import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Logo } from "../../brand/Logo";
import { BrandText } from "../../shared/components/BrandText";
import { api, ApiError, type AdminUser, type Dashboard, type Enquiry, type Page, type Status } from "./adminApi";
import "./admin.css";

/**
 * The private enquiries dashboard (/admin/enquiries). It holds no data of its
 * own: everything comes from the authenticated admin API, a page at a time.
 * Without a valid session the server returns nothing and the page shows the
 * sign-in form.
 */

const STATUSES: Status[] = ["new", "contacted", "closed"];
const TYPES: Record<string, string> = {
  general: "General",
  product: "Product",
  demo: "Demo request",
  "early-access": "Early access",
  collaboration: "Collaboration",
  distribution: "Distribution",
  oem: "OEM",
  investment: "Investment",
};
const SOURCES: Record<string, string> = {
  "contact-page": "Contact page",
  "contact-popup": "Know how it works pop-up",
  "try-demo-request": "Try Demo request",
  "early-bird-offer": "Early-bird offer",
};

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function AdminPage() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    document.title = "Enquiries · ChakraVue AI admin";
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.appendChild(robots);
    api
      .me()
      .then(({ admin }) => setAdmin(admin))
      .catch(() => setAdmin(null))
      .finally(() => setChecking(false));
    return () => robots.remove();
  }, []);

  return (
    <main className="adm" data-motion="own">
      {checking ? (
        <p className="adm__center">Checking your session…</p>
      ) : admin ? (
        <AdminDashboard admin={admin} onSignedOut={() => setAdmin(null)} />
      ) : (
        <AdminLogin onSignedIn={setAdmin} />
      )}
    </main>
  );
}

function AdminLogin({ onSignedIn }: { onSignedIn: (admin: AdminUser) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const { admin } = await api.login(String(data.get("email") ?? ""), String(data.get("password") ?? ""));
      onSignedIn(admin);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't sign in.");
      setBusy(false);
    }
  };

  return (
    <div className="adm__login">
      <form className="adm-card adm-login" onSubmit={submit}>
        <div className="adm-login__mark" aria-hidden="true">
          <Logo />
        </div>
        <h1>
          <BrandText text="ChakraVue AI" /> admin
        </h1>
        <p className="adm-muted">Sign in to view website enquiries.</p>
        <label className="adm-field">
          <span>Email</span>
          <input name="email" type="email" autoComplete="username" required maxLength={254} />
        </label>
        <label className="adm-field">
          <span>Password</span>
          <input name="password" type="password" autoComplete="current-password" required maxLength={200} />
        </label>
        {error && (
          <p className="adm-alert" role="alert">
            {error}
          </p>
        )}
        <button className="adm-btn adm-btn--primary" type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

function AdminDashboard({ admin, onSignedOut }: { admin: AdminUser; onSignedOut: () => void }) {
  const [summary, setSummary] = useState<Dashboard | null>(null);
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [product, setProduct] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [pageNo, setPageNo] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);

  // A signed-out or expired session sends the admin back to sign-in.
  const guard = useCallback(
    (e: unknown) => {
      if (e instanceof ApiError && e.status === 401) onSignedOut();
      else setError(e instanceof ApiError ? e.message : "Something went wrong.");
    },
    [onSignedOut],
  );

  const loadSummary = useCallback(() => {
    api.dashboard().then(setSummary).catch(guard);
  }, [guard]);

  const loadPage = useCallback(() => {
    const params = new URLSearchParams({ page: String(pageNo), limit: "20", sort });
    if (search) params.set("q", search);
    if (status) params.set("status", status);
    if (type) params.set("enquiryType", type);
    if (product) params.set("product", product);
    setLoading(true);
    setError("");
    api
      .list(params)
      .then(setPage)
      .catch(guard)
      .finally(() => setLoading(false));
  }, [pageNo, sort, search, status, type, product, guard]);

  useEffect(loadSummary, [loadSummary]);
  useEffect(loadPage, [loadPage]);

  // Search as you type, a moment after you stop.
  useEffect(() => {
    const t = window.setTimeout(() => {
      setSearch(q.trim());
      setPageNo(1);
    }, 300);
    return () => window.clearTimeout(t);
  }, [q]);

  const signOut = async () => {
    await api.logout().catch(() => {});
    onSignedOut();
  };

  const filtered = !!(search || status || type || product);
  const reset = () => {
    setQ("");
    setSearch("");
    setStatus("");
    setType("");
    setProduct("");
    setPageNo(1);
  };

  return (
    <div className="adm__wrap">
      <header className="adm-top">
        <div className="adm-top__brand">
          <span className="adm-top__mark" aria-hidden="true">
            <Logo />
          </span>
          <div>
            <p className="adm-eyebrow">
              <BrandText text="ChakraVue AI" /> admin
            </p>
            <h1>Website enquiries</h1>
          </div>
        </div>
        <div className="adm-top__me">
          <span className="adm-muted">
            {admin.name} · {admin.email}
          </span>
          <button type="button" className="adm-btn" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>

      <section className="adm-metrics" aria-label="Summary">
        {(
          [
            ["Total", summary?.total, ""],
            ["New", summary?.new, "new"],
            ["Contacted", summary?.contacted, "contacted"],
            ["Closed", summary?.closed, "closed"],
          ] as const
        ).map(([label, value, key]) => (
          <button
            key={label}
            type="button"
            className={`adm-card adm-metric${status === key ? " is-on" : ""}`}
            onClick={() => {
              setStatus(key);
              setPageNo(1);
            }}
          >
            <span>{label}</span>
            <strong>{value ?? "–"}</strong>
          </button>
        ))}
      </section>

      {summary && summary.recent.length > 0 && (
        <section className="adm-card adm-recent" aria-labelledby="adm-recent-title">
          <h2 id="adm-recent-title">Recent enquiries</h2>
          <ul>
            {summary.recent.map((row) => (
              <li key={row.id}>
                <button type="button" onClick={() => setOpenId(row.id)}>
                  <span className={`adm-pill adm-pill--${row.status}`}>{row.status}</span>
                  <strong>{row.name}</strong>
                  <span className="adm-muted">{TYPES[row.enquiryType] ?? row.enquiryType}</span>
                  <span className="adm-muted adm-recent__when">{when(row.createdAt)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="adm-card adm-list" aria-labelledby="adm-list-title">
        <div className="adm-list__head">
          <h2 id="adm-list-title">All enquiries</h2>
          <span className="adm-muted">{page ? `${page.total} found` : ""}</span>
        </div>

        <div className="adm-filters" role="search">
          <label className="adm-field adm-field--grow">
            <span>Search</span>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, email, organisation or phone" maxLength={100} />
          </label>
          <label className="adm-field">
            <span>Status</span>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPageNo(1);
              }}
            >
              <option value="">All</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="adm-field">
            <span>Enquiry type</span>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPageNo(1);
              }}
            >
              <option value="">All</option>
              {Object.entries(TYPES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="adm-field">
            <span>Product</span>
            <select
              value={product}
              onChange={(e) => {
                setProduct(e.target.value);
                setPageNo(1);
              }}
            >
              <option value="">All</option>
              {(summary?.products ?? []).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="adm-field">
            <span>Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as "newest" | "oldest")}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
          {filtered && (
            <button type="button" className="adm-btn adm-filters__reset" onClick={reset}>
              Clear filters
            </button>
          )}
        </div>

        {error && (
          <p className="adm-alert" role="alert">
            {error}{" "}
            <button type="button" className="adm-link" onClick={loadPage}>
              Try again
            </button>
          </p>
        )}

        <div className="adm-table-wrap" aria-busy={loading}>
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">Received</th>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Phone</th>
                <th scope="col">Organisation</th>
                <th scope="col">Visitor type</th>
                <th scope="col">Products</th>
                <th scope="col">Type</th>
                <th scope="col">Source</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {page?.items.map((row) => (
                <tr key={row.id} onClick={() => setOpenId(row.id)}>
                  <td className="adm-nowrap">{when(row.createdAt)}</td>
                  <td>
                    <button type="button" className="adm-link" onClick={() => setOpenId(row.id)}>
                      {row.name}
                    </button>
                  </td>
                  <td>{row.email}</td>
                  <td className="adm-nowrap">{row.phone ?? "–"}</td>
                  <td>{row.organization ?? "–"}</td>
                  <td>{row.visitorType ?? "–"}</td>
                  <td>{row.productInterest?.join(", ") || "–"}</td>
                  <td>{TYPES[row.enquiryType] ?? row.enquiryType}</td>
                  <td>{SOURCES[row.sourceForm] ?? row.sourceForm}</td>
                  <td>
                    <span className={`adm-pill adm-pill--${row.status}`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && !page && <p className="adm-empty">Loading enquiries…</p>}
          {page && page.items.length === 0 && (
            <p className="adm-empty">{filtered ? "No enquiries match these filters." : "No enquiries yet. Submissions from the website forms will appear here."}</p>
          )}
        </div>

        {page && page.pages > 1 && (
          <nav className="adm-pager" aria-label="Pages">
            <button type="button" className="adm-btn" disabled={pageNo <= 1 || loading} onClick={() => setPageNo((n) => n - 1)}>
              Previous
            </button>
            <span className="adm-muted">
              Page {page.page} of {page.pages}
            </span>
            <button type="button" className="adm-btn" disabled={pageNo >= page.pages || loading} onClick={() => setPageNo((n) => n + 1)}>
              Next
            </button>
          </nav>
        )}
      </section>

      {openId && (
        <EnquiryDetail
          id={openId}
          onClose={() => setOpenId(null)}
          onChanged={() => {
            loadPage();
            loadSummary();
          }}
          onError={guard}
        />
      )}
    </div>
  );
}

function EnquiryDetail({ id, onClose, onChanged, onError }: { id: string; onClose: () => void; onChanged: () => void; onError: (e: unknown) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");

  // Latest callbacks without re-running the load when the parent re-renders.
  const callbacks = useRef({ onClose, onError });
  callbacks.current = { onClose, onError };

  useEffect(() => {
    if (ref.current && !ref.current.open) ref.current.showModal();
    let live = true;
    api
      .get(id)
      .then(({ enquiry }) => live && setEnquiry(enquiry))
      .catch((e) => {
        if (!live) return;
        callbacks.current.onError(e);
        callbacks.current.onClose();
      });
    return () => {
      live = false;
    };
  }, [id]);

  const update = async (status: Status) => {
    if (!enquiry || saving || status === enquiry.status) return;
    setSaving(true);
    setNote("");
    try {
      const { enquiry: next } = await api.setStatus(enquiry.id, status);
      setEnquiry(next);
      setNote(`Marked as ${status}.`);
      onChanged();
    } catch (e) {
      setNote(e instanceof ApiError ? e.message : "Couldn't update the status.");
      onError(e);
    } finally {
      setSaving(false);
    }
  };

  const rows: [string, string | undefined][] = enquiry
    ? [
        ["Received", when(enquiry.createdAt)],
        ["Updated", when(enquiry.updatedAt)],
        ["Email", enquiry.email],
        ["Phone", enquiry.phone],
        ["Organisation", enquiry.organization],
        ["Designation", enquiry.designation],
        ["Department", enquiry.department],
        ["Country", enquiry.country],
        ["Visitor type", enquiry.visitorType],
        ["Audience", enquiry.audience],
        ["Products", enquiry.productInterest?.join(", ")],
        ["Enquiry type", TYPES[enquiry.enquiryType] ?? enquiry.enquiryType],
        ["Offer", enquiry.demoOfferInterest],
        ["Heard about us", enquiry.referralSource],
        ["Preferred contact", enquiry.contactMethod],
        ["Timeline", enquiry.timeline],
        ["Consent", enquiry.consent === undefined ? undefined : enquiry.consent ? "Agreed to be contacted" : "No"],
        ["Source form", SOURCES[enquiry.sourceForm] ?? enquiry.sourceForm],
        ["Source page", enquiry.sourcePage],
      ]
    : [];

  return (
    <dialog ref={ref} className="adm-detail" onClose={onClose} onClick={(e) => e.target === e.currentTarget && ref.current?.close()}>
      <div className="adm-detail__panel">
        <button type="button" className="adm-detail__close" aria-label="Close" onClick={() => ref.current?.close()}>
          ×
        </button>
        {!enquiry ? (
          <p className="adm-muted">Loading…</p>
        ) : (
          <>
            <p className="adm-eyebrow">Enquiry</p>
            <h2>{enquiry.name}</h2>
            <div className="adm-detail__status" role="group" aria-label="Status">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`adm-btn adm-status adm-status--${s}${enquiry.status === s ? " is-on" : ""}`}
                  aria-pressed={enquiry.status === s}
                  disabled={saving}
                  onClick={() => update(s)}
                >
                  {s}
                </button>
              ))}
              {note && (
                <span className="adm-muted" role="status">
                  {note}
                </span>
              )}
            </div>
            <dl className="adm-detail__grid">
              {rows
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
            </dl>
            <h3>Message</h3>
            <p className="adm-detail__message">{enquiry.message || "No message."}</p>
          </>
        )}
      </div>
    </dialog>
  );
}
