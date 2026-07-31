import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import {
  HELPER_EMAIL,
  HELPER_PASSWORD,
  HELPER_DISPLAY_NAME,
  ACTIVE_ROOM_CODE,
  ACTIVE_ROOM_NAME,
  RETURNING_ROOM_CODE,
  RETURNING_ROOM_NAME,
  CLOSED_ROOM_CODE,
} from './fixtures';

const PROJECT_ID = 'matchclass';

/**
 * Siembra los emuladores de Auth/Firestore antes de los specs de e2e (ver
 * `08-testing.md`: "corren contra los emuladores... nunca contra
 * producción"). Requiere `npm run emulators` corriendo antes de `npm run e2e`
 * — `FIRESTORE_EMULATOR_HOST`/`FIREBASE_AUTH_EMULATOR_HOST` apuntan al SDK
 * admin a los emuladores en vez de al proyecto real.
 */
export default async function globalSetup(): Promise<void> {
  process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST ??= '127.0.0.1:9099';

  const app = initializeApp({ projectId: PROJECT_ID });
  const auth = getAuth(app);
  const db = getFirestore(app);

  const existing = await auth.getUserByEmail(HELPER_EMAIL).catch(() => null);
  const helper =
    existing ??
    (await auth.createUser({
      email: HELPER_EMAIL,
      password: HELPER_PASSWORD,
      displayName: HELPER_DISPLAY_NAME,
    }));

  await db.doc(`users/${helper.uid}`).set({
    email: HELPER_EMAIL,
    displayName: HELPER_DISPLAY_NAME,
    role: 'helper',
    createdAt: new Date(),
  });

  const rooms: Array<{ code: string; name: string; status: 'active' | 'closed' }> = [
    { code: ACTIVE_ROOM_CODE, name: ACTIVE_ROOM_NAME, status: 'active' },
    { code: RETURNING_ROOM_CODE, name: RETURNING_ROOM_NAME, status: 'active' },
    { code: CLOSED_ROOM_CODE, name: 'Sala Cerrada de Prueba', status: 'closed' },
  ];

  for (const room of rooms) {
    const snapshot = await db.collection('rooms').where('code', '==', room.code).limit(1).get();
    if (!snapshot.empty) continue;

    await db.collection('rooms').add({
      code: room.code,
      name: room.name,
      subject: 'Materia de prueba',
      section: 'Secc 1',
      createdBy: helper.uid,
      createdAt: new Date(),
      status: room.status,
      helperBlockedSlots: [],
    });
  }
}
