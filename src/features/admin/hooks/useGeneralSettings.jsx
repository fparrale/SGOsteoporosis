import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  fetchImportHistory,
  getPaginatedBatches,
  buildPageNumbers,
} from "../services/GeneralSettingsService";
import Alert from "../../../components/ui/Alert";

const PAGE_SIZE = 7;

export function useGeneralSettings() {
  const { t } = useTranslation("admin");
  const [allData,     setAllData]     = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading,   setIsLoading]   = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchImportHistory();
      setAllData(data);
      setCurrentPage(1);
    } catch (e) {
      console.error("Error cargando historial:", e);
      Alert.error(t("sa_historial_err_load"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const { pagedData, startItem, endItem, totalPages } =
    getPaginatedBatches(allData, currentPage, PAGE_SIZE);

  const pageNums   = buildPageNumbers(currentPage, totalPages);
  const totalItems = allData.length;

  const goPage = useCallback(
    (n) => { if (n >= 1 && n <= totalPages) setCurrentPage(n); },
    [totalPages]
  );

  const handleReload = useCallback(() => { load(); }, [load]);

  return {
    pagedData,
    totalItems,
    startItem,
    endItem,
    currentPage,
    totalPages,
    pageNums,
    isLoading,
    goPage,
    handleReload,
  };
}
