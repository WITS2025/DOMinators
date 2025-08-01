import { Auth } from 'aws-amplify';
import { useEffect, useState } from 'react';

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
    <div>
      <h2>Welcome, {username}!</h2>
    </div>
  );
}

export default UserInfo;
