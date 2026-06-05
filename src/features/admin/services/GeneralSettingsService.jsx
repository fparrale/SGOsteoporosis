import { API_URL } from "../../auth/constants/adminLoginConstants";

const AUTH_HEADER = () => ({
  "Content-Type": "application/json",
  ...(localStorage.getItem("admin_token")
    ? { Authorization: `Bearer ${localStorage.getItem("admin_token")}` }
    : {}),
});

export async function fetchImportHistory() {
  const res  = await fetch(`${API_URL}/superadmin/import-history`, { headers: AUTH_HEADER() });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
  return body.data ?? [];
}

export function getPaginatedBatches(data, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const safePage   = Math.max(1, Math.min(page, totalPages));
  const pagedData  = data.slice((safePage - 1) * pageSize, safePage * pageSize);
  const startItem  = data.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem    = Math.min(safePage * pageSize, data.length);
  return { pagedData, startItem, endItem, totalPages };
}

export function buildPageNumbers(currentPage, totalPages) {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = [1];
  if (currentPage > 3) pages.push("...");
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
    pages.push(i);
  }
  if (currentPage < totalPages - 2) pages.push("...");
  pages.push(totalPages);
  return pages;
}

export function calcProgressPct(verified, total) {
  if (!total) return 0;
  return Math.round((verified / total) * 100);
}
