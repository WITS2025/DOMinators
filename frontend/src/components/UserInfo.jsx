import { useEffect, useState } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';

function UserInfo() {
  const [username, setUsername] = useState('');

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then(user => {
        setUsername(user.username); // or user.attributes.email, etc.
      })
      .catch(err => console.log('Error fetching user', err));
  }, []);

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div>
          <h2>Welcome, {user.username}!</h2>
        </div>
      )}
    </Authenticator>
  );
}

export default UserInfo;
