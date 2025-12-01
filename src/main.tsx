import React from 'react';
import ReactDOM from 'react-dom/client';
import FixsyPartsApp from './FixsyPartsApp';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './styles/forms.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <FixsyPartsApp />
  </React.StrictMode>
);
