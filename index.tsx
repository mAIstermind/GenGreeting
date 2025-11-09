import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AgencyDashboard } from './components/AgencyDashboard';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

const AppRouter: React.FC = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view');

    if (view === 'agency') {
        return <AgencyDashboard />;
    }
    
    return <App />;
};


root.render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);