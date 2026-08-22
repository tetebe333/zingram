import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

import serviceAccount from '../../../serviceAccountKey.json';

const firebaseAdminApp =
    getApps().length > 0
        ? getApps()[0]
        : initializeApp({
            credential: cert(serviceAccount as any)
        });

export const adminMessaging =
    getMessaging(firebaseAdminApp);

export const adminDb =
    getFirestore(firebaseAdminApp);