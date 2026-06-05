// ─── useIAConfig.jsx ──────────────────────────────────────────────────────────
// Gestiona la configuración de IA del admin: modelo activo, prompt y temperatura.
// `baseline` guarda el estado al cargar/guardar para detectar cambios sin dirty flag manual.

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Alert from "../../../components/ui/Alert";

import {
  DEFAULT_PROMPT,
  DEFAULT_TEMPERATURE,
  TEMPERATURE_THRESHOLDS,
  TEMPERATURE_LEVEL_KEYS,
} from "../constants/iaConfigConstants";

import {
  saveIAConfig,
  fetchIAConfig,
  fetchAdminIAModels,
  selectAdminIAModel,
} from "../services/IAConfigServices";

function snapshot(s) {
  return { prompt: s.prompt, temperature: s.temperature };
}

function equalSnapshot(a, b) {
  if (!a || !b) return false;
  return a.prompt === b.prompt && a.temperature === b.temperature;
}

export function useIAConfig() {
  const { t } = useTranslation("iaconfig");

  const [iaModels, setIaModels]         = useState([]);
  const [prompt, setPrompt]             = useState(DEFAULT_PROMPT);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [temperature, setTemperature]   = useState(DEFAULT_TEMPERATURE);
  const [baseline, setBaseline]         = useState(null);
  const [isLoading, setIsLoading]       = useState(true);

  const fields = useMemo(
    () => ({ prompt, temperature }),
    [prompt, temperature]
  );

  const hasChanges = useMemo(() => {
    if (!baseline) return false;
    return !equalSnapshot(snapshot(fields), baseline);
  }, [fields, baseline]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const [remote, models] = await Promise.all([
          fetchIAConfig(),
          fetchAdminIAModels(),
        ]);

        if (cancelled) return;

        setIaModels(models);

        if (remote) {
          const p    = remote.prompt ?? DEFAULT_PROMPT;
          const temp = Number.isFinite(remote.temperature) ? remote.temperature : DEFAULT_TEMPERATURE;
          setPrompt(p);
          setTemperature(temp);
          setBaseline(snapshot({ prompt: p, temperature: temp }));
        } else {
          setBaseline(snapshot({ prompt: DEFAULT_PROMPT, temperature: DEFAULT_TEMPERATURE }));
          Alert.error(t("alert_load_error"));
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setBaseline(snapshot({ prompt: DEFAULT_PROMPT, temperature: DEFAULT_TEMPERATURE }));
          Alert.error(t("alert_load_error"));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const getTemperatureLevel = useCallback((val) => {
    if (val <= TEMPERATURE_THRESHOLDS.precise) return TEMPERATURE_LEVEL_KEYS.precise;
    if (val <= TEMPERATURE_THRESHOLDS.balanced) return TEMPERATURE_LEVEL_KEYS.balanced;
    return TEMPERATURE_LEVEL_KEYS.creative;
  }, []);

  const temperatureLevel = getTemperatureLevel(temperature);

  const resolvedLevel = {
    label: t(temperatureLevel.label),
    desc: t(temperatureLevel.desc),
  };

  const temperaturePct = Math.round(temperature * 100);
  const temperatureSliderBg = `linear-gradient(to right, #0f1f5c 0%, #0f1f5c ${temperaturePct}%, #e2e8f0 ${temperaturePct}%, #e2e8f0 100%)`;

  const handleSelectModel = useCallback(async (id) => {
    try {
      await selectAdminIAModel(id);
      const models = await fetchAdminIAModels();
      setIaModels(models);
      Alert.success(t("alert_model_selected"));
    } catch (e) {
      console.error(e);
      Alert.error(t("alert_model_select_error"));
    }
  }, [t]);

  const handleEditPrompt = useCallback(() => setIsEditingPrompt(true), []);
  const handleSavePrompt = useCallback(() => setIsEditingPrompt(false), []);

  const handleSave = useCallback(async () => {
    if (!baseline || isLoading) return;
    try {
      const saved = await saveIAConfig({ prompt, temperature });
      setBaseline(snapshot(saved));
      setPrompt(saved.prompt);
      setTemperature(saved.temperature);
      Alert.success(t("alert_saved"));
    } catch (e) {
      console.error(e);
      Alert.error(t("alert_save_error"));
    }
  }, [baseline, isLoading, prompt, temperature, t]);

  const handleReset = useCallback(() => {
    if (!baseline) return;
    setPrompt(baseline.prompt);
    setTemperature(baseline.temperature);
    setIsEditingPrompt(false);
    Alert.warning(t("alert_reset"));
  }, [baseline, t]);

  return {
    iaModels,
    handleSelectModel,
    prompt,
    setPrompt,
    isEditingPrompt,
    temperature,
    setTemperature,
    hasChanges,
    isLoading,
    temperaturePct,
    temperatureSliderBg,
    resolvedLevel,
    handleEditPrompt,
    handleSavePrompt,
    handleSave,
    handleReset,
  };
}
