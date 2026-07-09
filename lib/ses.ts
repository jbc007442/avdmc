import { SESClient } from '@aws-sdk/client-ses';

console.log('Initializing AWS SES...');
console.log('Region:', process.env.AWS_REGION);
console.log('Access Key Exists:', !!process.env.AWS_ACCESS_KEY_ID);
console.log('Secret Key Exists:', !!process.env.AWS_SECRET_ACCESS_KEY);
console.log('From Email:', process.env.AWS_SES_FROM_EMAIL);

export const ses = new SESClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
