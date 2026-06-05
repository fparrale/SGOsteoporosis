import { useTranslation } from 'react-i18next';

export default function Auditoria() {
  const { t } = useTranslation('admin');
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: '0 0 12px', fontSize: 22 }}>{t('nav_auditoria', { defaultValue: 'Auditoría' })}</h1>
      <p style={{ color: '#64748b', margin: 0 }}>
        {t('auditoria_placeholder', { defaultValue: 'Módulo de auditoría (en construcción).' })}
      </p>
    </div>
  );
}
