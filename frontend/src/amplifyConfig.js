import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_1_79Hk5yZKH',
    userPoolWebClientId: '5u5plsk9gkceno0fefr1dojgsl',
  }
});

