// ─── usePlayerList.jsx ────────────────────────────────────────────────────────
// Hook que encapsula carga desde la BD, búsqueda y paginación de jugadores.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo, useCallback } from "react";

import { DEFAULT_PER_PAGE } from "../constants/playerListConstants";
import { fetchPlayers, getAvatarUrl } from "../services/PlayerListService";

export function usePlayerList() {
  const [allPlayers,  setAllPlayers]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [search,      setSearch]      = useState("");
  const [page,        setPage]        = useState(1);
  const [perPage,     setPerPage]     = useState(DEFAULT_PER_PAGE);
  const [refreshKey,  setRefreshKey]  = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchPlayers()
      .then((players) => setAllPlayers(players))
      .catch((err)    => setError(err.message))
      .finally(()     => setLoading(false));
  }, [refreshKey]);

  const onRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // Filtrado local por búsqueda
  const filtered = useMemo(() => {
    if (!search.trim()) return allPlayers;
    const q = search.toLowerCase();
    return allPlayers.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        String(p.id).includes(q),
    );
  }, [allPlayers, search]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage   = Math.min(page, totalPages);

  const visible = useMemo(
    () =>
      filtered
        .slice((safePage - 1) * perPage, safePage * perPage)
        .map((p) => ({ ...p, avatarUrl: getAvatarUrl(p.seed) })),
    [filtered, safePage, perPage],
  );

  const pageNums = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (safePage > 3) pages.push("...");
    for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) {
      pages.push(i);
    }
    if (safePage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  }, [totalPages, safePage]);

  const onGoPage = useCallback((p) => setPage(Math.max(1, Math.min(p, totalPages))), [totalPages]);
  const onSearch = useCallback((value) => { setSearch(value); setPage(1); }, []);
  const onPerPage = useCallback((value) => { setPerPage(value); setPage(1); }, []);

  return {
    search,
    page: safePage,
    perPage,
    visible,
    filtered,
    totalPlayers: allPlayers.length,
    totalPages,
    safePage,
    pageNums,
    loading,
    error,
    onSearch,
    onGoPage,
    onPerPage,
    onRefresh,
  };
}
