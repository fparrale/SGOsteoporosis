import React from 'react';

export default class GlobalErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[OsteoApp]', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: 16,
        fontFamily: 'sans-serif',
        color: '#1e293b',
      }}>
        <h2 style={{ margin: 0, fontSize: 30 }}>Algo salió mal</h2>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="72"
          height="72"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ef4444"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p style={{ margin: 0, color: '#64748b', fontSize: 18 }}>
          Ocurrió un error inesperado. Recarga la página para continuar.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 22px',
            borderRadius: 8,
            border: 'none',
            background: '#3b82f6',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          Recargar
        </button>
      </div>
    );
  }
}
