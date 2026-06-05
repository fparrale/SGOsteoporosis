import React from 'react';
import { Loader as RSuiteLoader } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';

// Dos modos: pantalla completa con fondo oscuro (default) o spinner inline sin overlay.
const Loader = ({ loading, content = 'Cargando...', inline = false }) => {
  if (!loading) return null;

  if (inline) {
    return (
      <div style={{ padding: '48px 20px', textAlign: 'center' }}>
        <RSuiteLoader speed="fast" content={content} vertical size="md" />
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 9999,
    }}>
      <RSuiteLoader
        backdrop
        speed="fast"
        content={content}
        vertical
        size="lg"
      />
    </div>
  );
};

export default Loader;
