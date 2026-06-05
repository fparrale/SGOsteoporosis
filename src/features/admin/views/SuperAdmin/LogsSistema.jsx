import { useState, useEffect, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { fetchLogs } from "../../services/SuperAdminServices";
import Alert from "../../../../components/ui/Alert";
import Loader from "../../../../components/ui/Loader";
import "./LogsSistema.css";

const ACCION_CLASS = {
  crear_pregunta: "badge-accion--crear",
  eliminar_sala: "badge-accion--eliminar",
  editar_prompt: "badge-accion--editar",
  importar_csv: "badge-accion--importar",
};

const PAGE_SIZE = 10;

function getPageNumbers(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 3) pages.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

export default function LogsSistema() {
  const { t } = useTranslation("admin");
  const [logs, setLogs] = useState([]);
  const [loading, setLoad] = useState(true);
  const [search, setSearch] = useState("");
  const [rolFilter, setRol] = useState("");
  const [page, setPage] = useState(1);

  const loadLogs = useCallback(async () => {
    setLoad(true);
    try {
      const filters = {};
      if (rolFilter) filters.rol = rolFilter;
      if (search) filters.accion = search;
      const data = await fetchLogs(filters);
      setLogs(data);
    } catch (err) {
      console.error("Error cargando logs:", err);
      Alert.error(t("sa_logs_err_load"));
    } finally {
      setLoad(false);
    }
  }, [rolFilter, search, t]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const filtered = logs.filter(
    (l) =>
      (!search ||
        l.detalle?.toLowerCase().includes(search.toLowerCase()) ||
        l.accion.includes(search.toLowerCase())) &&
      (!rolFilter || l.rol_ejecutor === rolFilter)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pageNumbers = getPageNumbers(safePage, totalPages);

  const handleSearch = (val) => { setSearch(val); setPage(1); };
  const handleRol = (val) => { setRol(val); setPage(1); };

  return (
    <div className="logs-sistema">
      <div className="logs-sistema__header">
        <h1>{t("sa_logs_title")}</h1>
        <p>{t("sa_logs_subtitle")}</p>
      </div>

      <div className="filtros-bar">
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            className="search-input"
            placeholder={t("sa_logs_search_placeholder")}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={rolFilter}
          onChange={(e) => handleRol(e.target.value)}
        >
          <option value="">{t("sa_logs_filter_all_roles")}</option>
          <option>Administrador</option>
          <option>Superadministrador</option>
          <option>Auditor</option>
          <option>Dev</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <Loader loading content={t("sa_logs_loading")} inline />
        ) : (
          <div className="table-scroll">
          <table className="table-logs">
            <thead>
              <tr>
                {[
                  t("sa_logs_col_date"),
                  t("sa_logs_col_role"),
                  t("sa_logs_col_action"),
                  t("sa_logs_col_table"),
                  t("sa_logs_col_detail"),
                  t("sa_logs_col_ip"),
                ].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((l) => (
                <tr key={l.id}>
                  <td className="cell-fecha">{l.created_at}</td>
                  <td className="cell-rol">{l.rol_ejecutor}</td>
                  <td>
                    <span
                      className={`badge-accion ${ACCION_CLASS[l.accion] || "badge-accion--default"}`}
                    >
                      {l.accion}
                    </span>
                  </td>
                  <td className="cell-tabla">{l.tabla_afectada ?? "—"}</td>
                  <td className="cell-detalle">{l.detalle ?? "—"}</td>
                  <td className="cell-ip">{l.ip ?? "—"}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    {t("sa_logs_empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="logs-pagination">
            <span className="logs-pagination__info">
              {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} de {filtered.length}
            </span>
            <div className="logs-pagination__btns">
              <button
                className="logs-page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
              >
                <ChevronLeft size={15} />
              </button>
              {pageNumbers.map((n, i) =>
                n === "..." ? (
                  <span key={`dots-${i}`} className="logs-pagination-dots">…</span>
                ) : (
                  <button
                    key={n}
                    className={`logs-page-btn ${n === safePage ? "logs-page-btn--active" : ""}`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                )
              )}
              <button
                className="logs-page-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
