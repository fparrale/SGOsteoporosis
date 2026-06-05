import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import GlobalErrorBoundary from './components/GlobalErrorBoundary.jsx';
import 'rsuite/dist/rsuite.min.css';
import './tailwind.css';
import './styles/global.css';
import i18n from './i18n';
import { I18nextProvider } from 'react-i18next';
import { setWasmUrl } from '@lottiefiles/dotlottie-react';

setWasmUrl(import.meta.env.BASE_URL + 'dotlottie-player.wasm');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <App />
        </BrowserRouter>
      </I18nextProvider>
    </GlobalErrorBoundary>
  </React.StrictMode>,
)

