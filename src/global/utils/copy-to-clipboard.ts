/**
 * Portapapeles con fallback de selección manual (RC-011 §5, HU-09
 * Escenario 4). Vive en `global/utils/` (no en `resources/`, a diferencia de
 * `generate-short-code.ts`): usa el DOM (`navigator`, `document`,
 * `HTMLElement`) y no lo llama nada en `library/` — no aplica la excepción
 * documentada ahí.
 */

/**
 * Copia `text` al portapapeles si el navegador soporta la Clipboard API.
 * Nunca lanza: si `navigator.clipboard.writeText` no existe o la llamada
 * falla (permiso denegado, contexto no seguro, etc.), devuelve `false` para
 * que quien llama pueda caer al fallback de `selectElementText`.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!navigator.clipboard?.writeText) return false;

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Fallback del Escenario 4: en vez de una copia programática alternativa
 * (`document.execCommand`, deprecado), selecciona visualmente el contenido
 * de `el` con la Selection API para que el usuario lo copie él mismo con
 * `Ctrl+C`/`Cmd+C` — la HU pide literalmente "se muestra el código
 * seleccionado".
 */
export function selectElementText(el: HTMLElement): void {
  const selection = window.getSelection();
  if (!selection) return;

  const range = document.createRange();
  range.selectNodeContents(el);
  selection.removeAllRanges();
  selection.addRange(range);
}
