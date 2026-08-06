import { initializeApp } from 'firebase-admin/app';
import { getAuth, type Auth, type UserRecord } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import {
  HELPER_EMAIL,
  HELPER_PASSWORD,
  HELPER_DISPLAY_NAME,
  ACTIVE_ROOM_CODE,
  ACTIVE_ROOM_NAME,
  RETURNING_ROOM_CODE,
  RETURNING_ROOM_NAME,
  CLOSED_ROOM_CODE,
  DASHBOARD_HELPER_EMAIL,
  DASHBOARD_HELPER_PASSWORD,
  DASHBOARD_HELPER_DISPLAY_NAME,
  DASHBOARD_ACTIVE_ROOM_CODE,
  DASHBOARD_ACTIVE_ROOM_NAME,
  DASHBOARD_ACTIVE_ROOM_RESPONSES,
  DASHBOARD_ACTIVE_ROOM_STUDENT_LIMIT,
  DASHBOARD_ACTIVE_ROOM_2_CODE,
  DASHBOARD_ACTIVE_ROOM_2_NAME,
  DASHBOARD_ACTIVE_ROOM_2_RESPONSES,
  DASHBOARD_CLOSED_ROOM_CODE,
  DASHBOARD_CLOSED_ROOM_NAME,
  EMPTY_HELPER_EMAIL,
  EMPTY_HELPER_PASSWORD,
  EMPTY_HELPER_DISPLAY_NAME,
  CREATE_ROOM_HELPER_EMAIL,
  CREATE_ROOM_HELPER_PASSWORD,
  CREATE_ROOM_HELPER_DISPLAY_NAME,
} from './fixtures';

const PROJECT_ID = 'matchclass';

async function ensureHelper(
  auth: Auth,
  db: Firestore,
  { email, password, displayName }: { email: string; password: string; displayName: string },
): Promise<UserRecord> {
  const existing = await auth.getUserByEmail(email).catch(() => null);
  const user = existing ?? (await auth.createUser({ email, password, displayName }));

  await db.doc(`users/${user.uid}`).set({
    email,
    displayName,
    role: 'helper',
    createdAt: new Date(),
  });

  return user;
}

interface RoomSeed {
  code: string;
  name: string;
  status: 'active' | 'closed';
  createdBy: string;
  studentLimit?: number;
}

async function ensureRoom(db: Firestore, room: RoomSeed): Promise<string> {
  const snapshot = await db.collection('rooms').where('code', '==', room.code).limit(1).get();

  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    if (!doc) throw new Error(`unreachable: snapshot no vacío sin documentos (${room.code})`);
    if (room.studentLimit !== undefined) {
      await doc.ref.set({ studentLimit: room.studentLimit }, { merge: true });
    }
    return doc.id;
  }

  const data: Record<string, unknown> = {
    code: room.code,
    name: room.name,
    subject: 'Materia de prueba',
    section: 'Secc 1',
    createdBy: room.createdBy,
    createdAt: new Date(),
    status: room.status,
    helperBlockedSlots: [],
  };
  if (room.studentLimit !== undefined) data.studentLimit = room.studentLimit;

  const ref = await db.collection('rooms').add(data);
  return ref.id;
}

/** Siembra hasta `count` respuestas fake si la subcolección todavía está vacía — idempotente entre corridas. */
async function ensureResponses(db: Firestore, roomId: string, count: number): Promise<void> {
  if (count <= 0) return;

  const responsesRef = db.collection('rooms').doc(roomId).collection('responses');
  const existing = await responsesRef.limit(1).get();
  if (!existing.empty) return;

  const batch = db.batch();
  for (let i = 0; i < count; i += 1) {
    const fakeUid = `e2e-fake-student-${roomId}-${i}`;
    batch.set(responsesRef.doc(fakeUid), {
      roomId,
      studentName: `Alumno de Prueba ${i + 1}`,
      occupiedBlocks: [1, 2],
      createdByUid: fakeUid,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  await batch.commit();
}

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

  // Helper "genérico" (auth.spec / route-guard.spec / logout.spec /
  // student-access.spec) — sus salas NO se tocan acá con respuestas extra,
  // esos specs ya escriben las suyas en tiempo real.
  const helper = await ensureHelper(auth, db, {
    email: HELPER_EMAIL,
    password: HELPER_PASSWORD,
    displayName: HELPER_DISPLAY_NAME,
  });

  await ensureRoom(db, { code: ACTIVE_ROOM_CODE, name: ACTIVE_ROOM_NAME, status: 'active', createdBy: helper.uid });
  await ensureRoom(db, {
    code: RETURNING_ROOM_CODE,
    name: RETURNING_ROOM_NAME,
    status: 'active',
    createdBy: helper.uid,
  });
  await ensureRoom(db, {
    code: CLOSED_ROOM_CODE,
    name: 'Sala Cerrada de Prueba',
    status: 'closed',
    createdBy: helper.uid,
  });

  // Helper dedicado del dashboard (RC-008, Escenario 1): salas y respuestas
  // exclusivas, con valores fijos que `dashboard.spec.ts` puede afirmar
  // exactamente sin interferencia de otros specs en paralelo.
  const dashboardHelper = await ensureHelper(auth, db, {
    email: DASHBOARD_HELPER_EMAIL,
    password: DASHBOARD_HELPER_PASSWORD,
    displayName: DASHBOARD_HELPER_DISPLAY_NAME,
  });

  const dashActiveRoomId = await ensureRoom(db, {
    code: DASHBOARD_ACTIVE_ROOM_CODE,
    name: DASHBOARD_ACTIVE_ROOM_NAME,
    status: 'active',
    createdBy: dashboardHelper.uid,
    studentLimit: DASHBOARD_ACTIVE_ROOM_STUDENT_LIMIT,
  });
  await ensureResponses(db, dashActiveRoomId, DASHBOARD_ACTIVE_ROOM_RESPONSES);

  const dashActiveRoom2Id = await ensureRoom(db, {
    code: DASHBOARD_ACTIVE_ROOM_2_CODE,
    name: DASHBOARD_ACTIVE_ROOM_2_NAME,
    status: 'active',
    createdBy: dashboardHelper.uid,
  });
  await ensureResponses(db, dashActiveRoom2Id, DASHBOARD_ACTIVE_ROOM_2_RESPONSES);

  await ensureRoom(db, {
    code: DASHBOARD_CLOSED_ROOM_CODE,
    name: DASHBOARD_CLOSED_ROOM_NAME,
    status: 'closed',
    createdBy: dashboardHelper.uid,
  });

  // Helper sin salas (RC-008, Escenario 2 — empty state).
  await ensureHelper(auth, db, {
    email: EMPTY_HELPER_EMAIL,
    password: EMPTY_HELPER_PASSWORD,
    displayName: EMPTY_HELPER_DISPLAY_NAME,
  });

  // Helper dedicado a `create-room.spec.ts` (RC-009, HU-07) — sin salas
  // sembradas: las crea el propio spec.
  await ensureHelper(auth, db, {
    email: CREATE_ROOM_HELPER_EMAIL,
    password: CREATE_ROOM_HELPER_PASSWORD,
    displayName: CREATE_ROOM_HELPER_DISPLAY_NAME,
  });
}
