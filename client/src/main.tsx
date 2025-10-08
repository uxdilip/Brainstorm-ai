import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { BoardProvider } from './context/BoardContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AuthProvider>
            <BoardProvider>
                <App />
            </BoardProvider>
        </AuthProvider>
    </React.StrictMode>
);
