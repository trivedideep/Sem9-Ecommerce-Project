import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { store } from './store/store';

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

if (!googleClientId) {
    // eslint-disable-next-line no-console
    console.warn('Missing REACT_APP_GOOGLE_CLIENT_ID environment variable. Google sign-in will be disabled.');
}

const root = ReactDOM.createRoot(document.getElementById('root'));

const AppTree = (
    <Provider store={store}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>
);

root.render(
    <GoogleOAuthProvider clientId={googleClientId || 'missing-client-id'}>
        {AppTree}
    </GoogleOAuthProvider>
);

