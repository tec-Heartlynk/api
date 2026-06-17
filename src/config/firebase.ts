import * as admin from 'firebase-admin';
import * as serviceAccount from './serviceAccountKey.json';

console.log(
  ' admin.apps.length ',
  admin.apps.length,
  admin.apps,
  serviceAccount,
);
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
    }),
  });
}

export default admin;
