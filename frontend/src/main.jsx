import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import { Amplify } from 'aws-amplify';
import { Hub } from 'aws-amplify/utils';
import awsconfig from './aws-exports';
import { Authenticator } from '@aws-amplify/ui-react';
import { AuthProvider } from './context/AuthContext';

// Dynamically override redirect URLs based on environment
const isLocal = window.location.hostname === 'localhost';

const updatedConfig = {
  ...awsconfig,
  oauth: {
    ...awsconfig.oauth,
    redirectSignIn: isLocal
      ? 'http://localhost:5173/'
      : 'https://main.d2jqd7far0nraw.amplifyapp.com/',
    redirectSignOut: isLocal
      ? 'http://localhost:5173/'
      : 'https://main.d2jqd7far0nraw.amplifyapp.com/',
  },
};

Amplify.configure(updatedConfig);

// Listen for sign-in events and reload the app
Hub.listen('auth', ({ payload }) => {
  const { event } = payload;
  if (event === 'signIn') {
    console.log('Sign-in event detected, reloading...');
    window.location.reload();
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Authenticator>
      {({ signOut, user }) => {
        // Log the entire user object to console
        console.log('Full user object:', user);
        console.log('User object keys:', Object.keys(user));
        console.log('User attributes:', user.attributes);
        console.log('User signInDetails:', user.signInDetails);
        
        return (
          <AuthProvider user={user} signOut={signOut}>
            <App />
          </AuthProvider>
        );
      }}
    </Authenticator>
  </React.StrictMode>
);
