import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './auth-styles.css'; // Add this new CSS file

import { Amplify } from 'aws-amplify';
import { Hub } from 'aws-amplify/utils';
import awsconfig from './aws-exports';
import { Authenticator } from '@aws-amplify/ui-react';
import { AuthProvider } from './context/AuthContext';
import logo from './assets/TripTrekLogo.png';

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
    <Authenticator
      formFields={{
        signUp: {
          username: {
            order: 1,
            placeholder: 'Enter username',
            isRequired: true,
          },
          preferred_username: {
            order: 2,
            placeholder: 'Enter your preferred username',
            isRequired: true,
          },
          email: {
            order: 3,
            placeholder: 'name@host.com',
            isRequired: true,
          },
          password: {
            order: 4,
            placeholder: 'Enter password',
            isRequired: true,
          },
          confirm_password: {
            order: 5,
            placeholder: 'Reenter password',
            isRequired: true,
          },
        },
        signIn: {
          username: {
            placeholder: 'Enter username',
          },
          password: {
            placeholder: 'Enter password',
          },
        },
      }}
      components={{
        Header() {
          return (
            <div className="auth-header">
              <img src={logo} alt="TripTrek" className="auth-logo" />
            </div>
          );
        },
      }}
    >
      {({ signOut, user }) => {
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
