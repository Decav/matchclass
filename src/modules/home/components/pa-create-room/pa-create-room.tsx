import { useState } from 'react';
import { DoorOpen, LayoutDashboard, Users } from 'lucide-react';
import { Q5AppShell, type Q5NavItem } from '@global/components/q5-app-shell';
import { Q3SidebarUserPanel } from '../q3-sidebar-user-panel';
import { Q4CreateRoomForm, type Q4CreateRoomFormSuccess } from '../q4-create-room-form';
import { Q4RoomCreatedConfirmation } from '../q4-room-created-confirmation';

// Mismos ítems que `PaDashboard` (RC-008 §10) — duplicado a propósito en vez
// de importar de `pa-dashboard` (los módulos de `home/components` no se
// importan entre sí para no crear un acoplamiento incidental entre dos
// páginas de rutas distintas).
const NAV_ITEMS: Q5NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Mis salas', icon: DoorOpen, to: '/dashboard', matchActive: false },
  { label: 'Próximamente', icon: Users, disabled: true },
];

type CreateRoomStep = 'form' | 'confirmation';

/**
 * Página `/salas/nueva` (RC-009, HU-07) — reemplaza `PaNewRoomPlaceholder`
 * (RC-008). Dos estados internos con `useState` (sin cambiar de ruta) —
 * mismo criterio que `PaRecoverPassword` (RC-007) y `Q5StudentAccessFlow`
 * (RC-003): un componente decide qué sub-vista mostrar.
 *
 * El resultado de la creación (`id`/`name`/`code`) se guarda en estado local
 * para la confirmación — no hace falta releer Firestore (RC-009 §6, paso 3).
 */
export function PaCreateRoom() {
  const [step, setStep] = useState<CreateRoomStep>('form');
  const [result, setResult] = useState<Q4CreateRoomFormSuccess | null>(null);

  function handleSuccess(data: Q4CreateRoomFormSuccess) {
    setResult(data);
    setStep('confirmation');
  }

  return (
    <Q5AppShell
      navItems={NAV_ITEMS}
      footer={<Q3SidebarUserPanel />}
      title={step === 'form' ? 'Nueva sala' : 'Sala creada'}
    >
      <div className="flex h-full items-center justify-center">
        {step === 'form' || !result ? (
          <Q4CreateRoomForm onSuccess={handleSuccess} />
        ) : (
          <Q4RoomCreatedConfirmation roomId={result.id} name={result.name} code={result.code} />
        )}
      </div>
    </Q5AppShell>
  );
}
