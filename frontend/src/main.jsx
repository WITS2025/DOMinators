import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';


import { Amplify, Auth } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import awsconfig from './aws-exports'

Amplify.configure(awsconfig);                                                         


Auth.currentAuthenticatedUser()
  .then(user => {

    console.log('User is authenticated:', user);

    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <Authenticator>
          {({ signOut, user }) => (
            <>
              <App />
              <div>
                <h1>Hello, {user.username}</h1>
                <button onClick={signOut}>Sign Out</button>
              </div>
            </>
          )}
        </Authenticator>
      </React.StrictMode>
);

  })
  .catch(() => {
    // redirect to login
    window.location.href = 'https://trekatrip.auth.us-east-1.amazoncognito.com/login?client_id=5u5plsk9gkceno0fefr1dojgsl&redirect_uri=https://main.d2jqd7far0nraw.amplifyapp.com/&response_type=code&scope=email+openid+phone';
  });