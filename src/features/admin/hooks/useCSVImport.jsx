// ─── useCSVImport.jsx ──────────────────────────────────────────────────────────
// Hook dedicado al flujo de importación de preguntas vía CSV.
// Separado de useQuestionBank para mantener cada hook con una sola responsabilidad.

import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Alert from "../../../components/ui/Alert";
import { uploadCSVQuestions } from "../services/IAConfigServices";

export function useCSVImport({ onImportSuccess } = {}) {
  const { t } = useTranslation("iaconfig");

  const [isUploading, setIsUploading]   = useState(false);
  const [importResult, setImportResult] = useState(null); // { importadas, errores, fileName }

  const handleCSVUpload = useCallback(async (file) => {
    if (!file) return;
    setIsUploading(true);
    setImportResult(null);
    try {
      const result = await uploadCSVQuestions(file);
      if (result.ok) {
        setImportResult({ importadas: result.importadas, errores: result.errores, fileName: file.name });
        if (result.importadas > 0 && result.errores === 0) {
          Alert.success(t("alert_csv_uploaded"));
        } else if (result.importadas > 0) {
          Alert.warning(t("alert_csv_uploaded"));
        } else {
          Alert.error(t("alert_csv_error"));
        }
        if (onImportSuccess) onImportSuccess();
      } else {
        Alert.error(result.error ?? t("alert_csv_error"));
      }
    } catch (err) {
      console.error("[useCSVImport]", err);
      Alert.error(t("alert_csv_error"));
    } finally {
      setIsUploading(false);
    }
  }, [t, onImportSuccess]);

  const handleResetImport = useCallback(() => {
    setImportResult(null);
  }, []);

  return {
    isUploading,
    importResult,
    handleCSVUpload,
    handleResetImport,
  };
}
