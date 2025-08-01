const awsmobile = {
  aws_project_region: 'us-east-1',
  aws_cognito_region: 'us-east-1',
  aws_user_pools_id: 'us-east-1_79Hk5yZKH',
  aws_user_pools_web_client_id: '5u5plsk9gkceno0fefr1dojgsl',
  oauth: {
    domain: 'trekatrip.auth.us-east-1.amazoncognito.com',
    scope: ['email', 'openid', 'phone'],
    redirectSignIn: 'http://localhost:5173/',
    redirectSignOut: 'http://localhost:5173/',
    responseType: 'code'
  }
};

export default awsmobile;
