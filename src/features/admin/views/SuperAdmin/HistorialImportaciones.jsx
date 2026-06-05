import { RefreshCw, Globe, Ban, Loader } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGeneralSettings } from "../../hooks/useGeneralSettings";
import "./HistorialImportaciones.css";

function TypeTag({ type }) {
  const isIA = type === "IA";
  return (
    <span className={`type-tag ${isIA ? "type-tag-ia" : "type-tag-csv"}`}>
      {type}
    </span>
  );
}

function ProviderTag({ provider, providerType }) {
  return (
    <span className="provider-tag">
      {providerType === "ai" ? (
        <Globe size={13} strokeWidth={2} color="#2563eb" />
      ) : (
        <Ban size={13} strokeWidth={2} />
      )}
      {provider}
    </span>
  );
}

function PageButton({ children, active, disabled, onClick, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`page-button ${active ? "page-button-active" : "page-button-inactive"}`}
    >
      {children}
    </button>
  );
}

export default function HistorialImportaciones() {
  const { t } = useTranslation("general");

  const {
    pagedData, totalItems, startItem, endItem,
    currentPage, totalPages, pageNums,
    isLoading, goPage, handleReload,
  } = useGeneralSettings();

  const columns = [
    { key: "batchName", label: t("col.batchName") },
    { key: "type",      label: t("col.type")      },
    { key: "provider",  label: t("col.provider")  },
    { key: "total",     label: t("col.total")     },
    { key: "idioma",    label: t("col.idioma")    },
    { key: "date",      label: t("col.date")      },
  ];

  return (
    <div className="general-settings">
      <div className="general-settings-container">

        <div className="general-settings-header">
          <div>
            <h1 className="general-settings-title">{t("title")}</h1>
            <p className="general-settings-subtitle">{t("subtitle")}</p>
          </div>
          <button
            onClick={handleReload}
            disabled={isLoading}
            className="reload-button"
            title={t("tooltip.reload")}
            aria-label={t("tooltip.reload")}
          >
            {isLoading ? (
              <>
                <Loader size={16} strokeWidth={2.5} className="spinner" />
                {t("loading")}
              </>
            ) : (
              <>
                <RefreshCw size={16} strokeWidth={2.2} />
                {t("reload")}
              </>
            )}
          </button>
        </div>

        <div className="card">

          <div className="table-container">
            <table className="table">
              <thead>
                <tr className="table-header">
                  {columns.map(({ key, label }) => (
                    <th
                      key={key}
                      className="table-header-cell"
                      style={{ textAlign: key === "actions" ? "center" : "left" }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={columns.length} className="loading-cell">
                      <div className="loading-container">
                        <Loader size={20} className="spinner" />
                        <span>{t("loadingData")}</span>
                      </div>
                    </td>
                  </tr>
                ) : pagedData.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="loading-cell">
                      {t("empty")}
                    </td>
                  </tr>
                ) : (
                  pagedData.map((row) => (
                    <tr key={row.id} className="table-body-row">
                      <td className="table-cell">
                        <span className="batch-name">{row.name}</span>
                      </td>
                      <td className="table-cell">
                        <TypeTag type={row.type} />
                      </td>
                      <td className="table-cell">
                        <ProviderTag provider={row.provider} providerType={row.providerType} />
                      </td>
                      <td className="table-cell numeric-data">{Number(row.total).toLocaleString()}</td>
                      <td className="table-cell">
                        <span className="type-tag" style={{ background: "#f0f9ff", color: "#0369a1", fontWeight: 600 }}>
                          {row.idioma?.toUpperCase() ?? "—"}
                        </span>
                      </td>
                      <td className="table-cell date-cell">{row.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="footer">
            <span className="footer-text">
              {t("page.showing")}{" "}
              <strong className="footer-text-strong">{startItem}–{endItem}</strong>{" "}
              {t("page.of")}{" "}
              <strong className="footer-text-strong">{totalItems}</strong>{" "}
              {t("page.results")}
            </span>
            <div className="pagination-container">
              <PageButton
                disabled={currentPage === 1}
                onClick={() => goPage(currentPage - 1)}
                label={t("page.previous")}
              >‹</PageButton>

              {pageNums.map((n, i) =>
                n === "..." ? (
                  <span key={i} className="pagination-dots">…</span>
                ) : (
                  <PageButton
                    key={i}
                    active={n === currentPage}
                    onClick={() => goPage(n)}
                    label={`${t("page.showing")} ${n}`}
                  >{n}</PageButton>
                )
              )}

              <PageButton
                disabled={currentPage === totalPages}
                onClick={() => goPage(currentPage + 1)}
                label={t("page.next")}
              >›</PageButton>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
