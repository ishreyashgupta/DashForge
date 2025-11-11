import React, { useEffect, useMemo, useState } from "react";
import { getUserAssignmentResponses } from "../../../../services/userService";

/**
 * DynamicResponsesViewer
 *
 * - 👤 User Mode → Uses pre-fetched `responses` passed via props OR fetches via assignmentId
 * - 🧑‍💼 Admin Mode → Automatically fetches all responses via `formId`
 */
export default function DynamicResponsesViewer({ form, formId, responses: propResponses, onClose }) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  /**
   * 🧠 Fetch or Use Preloaded Responses
   * - User mode → uses prop responses or assignment API
   * - Admin mode → fetches all responses by formId
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErr("");

        // ✅ Case 1: User provided pre-fetched responses (from parent)
        if (propResponses && Array.isArray(propResponses)) {
          setResponses(propResponses);
          return;
        }

        // ✅ Case 2: User mode - has assignmentId (form.assignmentId)
        if (form?.assignmentId) {
          const token = localStorage.getItem("token");
          const res = await getUserAssignmentResponses(token, form.assignmentId);
          setResponses(res.responses || []);
          return;
        }

        // ✅ Case 3: Admin mode - fetch all responses by formId
        if (formId) {
          const { getUDFResponses } = await import("../../../../services/udfservice");
          const res = await getUDFResponses(formId);
          setResponses(Array.isArray(res) ? res : []);
        }
      } catch (e) {
        console.error("❌ Error fetching responses:", e);
        setErr(e?.message || "Failed to load responses");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formId, form?.assignmentId, propResponses]);

  /**
   * 🧩 Build Dynamic Table Columns
   */
  const columns = useMemo(() => {
    const keysInData = new Set();
    responses.forEach((r) => {
      const data = r?.data || {};
      Object.keys(data).forEach((k) => keysInData.add(k));
    });

    const cols = [];
    const seen = new Set();

    const addCol = (key, label, type) => {
      if (!key || seen.has(key)) return;
      cols.push({ key, label: label || key, type });
      seen.add(key);
    };

    // Prefer form field order
    (form?.fields || []).forEach((f) => {
      const keyCandidate =
        f?.name || f?.fieldName || f?.key || f?.id || f?._id || f?.label;
      addCol(keyCandidate, f?.label || f?.placeholder || f?.name, f?.type);
    });

    // Add leftover keys not defined in the form
    keysInData.forEach((k) => addCol(k, k, undefined));

    // Always include "Submitted At"
    addCol("__createdAt", "Submitted At", "datetime");

    return cols;
  }, [responses, form]);

  /**
   * 🧩 Format Table Cell Values
   */
  const formatCell = (value, type) => {
    if (value == null) return "";
    if (Array.isArray(value)) {
      return value
        .map((v) => (typeof v === "object" ? JSON.stringify(v, null, 0) : String(v)))
        .join(", ");
    }
    if (typeof value === "object") {
      if (value?.url) {
        return (
          <a href={value.url} target="_blank" rel="noreferrer">
            {value.name || "File"}
          </a>
        );
      }
      return JSON.stringify(value);
    }
    if (type === "datetime") {
      const d = new Date(value);
      return isNaN(d) ? String(value) : d.toLocaleString();
    }
    const s = String(value);
    if (/^https?:\/\//i.test(s)) {
      return (
        <a href={s} target="_blank" rel="noreferrer">
          {s}
        </a>
      );
    }
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return s;
  };

  /**
   * 🧩 Build Table Rows
   */
  const rows = useMemo(() => {
    return (responses || [])
      .map((r) => {
        const base = { ...(r?.data || {}) };
        base.__createdAt = r?.createdAt || r?._createdAt || r?.timestamp;
        return { _id: r?._id || Math.random().toString(36).slice(2), ...base };
      })
      .sort((a, b) => new Date(b.__createdAt || 0) - new Date(a.__createdAt || 0));
  }, [responses]);

  // ------------------ UI ------------------
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          width: "95%",
          maxWidth: 1100,
          maxHeight: "85vh",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ---------- Header ---------- */}
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid #eee",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontWeight: 700 }}>
              Responses — {form?.name || "Untitled Form"}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>
              {form?.description}
            </div>
            <div style={{ fontSize: 12, color: "#999" }}>
              {propResponses
                ? "Viewing your submitted responses"
                : form?.assignmentId
                ? "Viewing your assignment responses"
                : "Viewing all responses"}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: "none",
              padding: "8px 12px",
              background: "#111",
              color: "#fff",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>

        {/* ---------- Table or Message ---------- */}
        <div style={{ padding: 16 }}>
          {loading ? (
            <div>Loading responses…</div>
          ) : err ? (
            <div style={{ color: "crimson" }}>{err}</div>
          ) : rows.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px", color: "#777" }}>
              {propResponses || form?.assignmentId
                ? "You haven’t submitted this form yet."
                : "No responses found for this form."}
            </div>
          ) : (
            <div
              style={{
                overflow: "auto",
                border: "1px solid #eee",
                borderRadius: 10,
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {columns.map((c) => (
                      <th
                        key={c.key}
                        style={{
                          textAlign: "left",
                          padding: "10px 12px",
                          background: "#fafafa",
                          borderBottom: "1px solid #eee",
                          whiteSpace: "nowrap",
                          position: "sticky",
                          top: 0,
                        }}
                        title={c.key}
                      >
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row._id}>
                      {columns.map((c) => (
                        <td
                          key={c.key}
                          style={{
                            padding: "10px 12px",
                            borderBottom: "1px solid #f2f2f2",
                            verticalAlign: "top",
                          }}
                        >
                          {formatCell(
                            c.key === "__createdAt"
                              ? row.__createdAt
                              : row[c.key],
                            c.type === "datetime" ? "datetime" : c.type
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
