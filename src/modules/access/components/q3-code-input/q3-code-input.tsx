import { useRef, type KeyboardEvent } from 'react';

export interface Q3CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  hasError?: boolean;
  disabled?: boolean;
  id?: string;
}

/**
 * Código de sala segmentado en celdas individuales (44×54px, HU-01
 * "Comportamiento Visual"). El foco salta a la siguiente celda al escribir y
 * retrocede con Backspace sobre una celda vacía.
 */
export function Q3CodeInput({
  value,
  onChange,
  length = 6,
  hasError = false,
  disabled = false,
  id,
}: Q3CodeInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const chars = Array.from({ length }, (_, index) => value[index] ?? '');

  function updateChar(index: number, char: string) {
    const nextChars = [...chars];
    nextChars[index] = char;
    onChange(nextChars.join(''));
  }

  function handleChange(index: number, rawValue: string) {
    const char = rawValue.slice(-1).toUpperCase();
    updateChar(index, char);
    if (char && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !chars[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  return (
    <div className="flex justify-center gap-2" role="group" aria-label="Código de sala">
      {chars.map((char, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          id={index === 0 ? id : undefined}
          value={char}
          onChange={(event) => {
            handleChange(index, event.target.value);
          }}
          onKeyDown={(event) => {
            handleKeyDown(index, event);
          }}
          disabled={disabled}
          maxLength={1}
          inputMode="text"
          autoComplete="off"
          aria-invalid={hasError}
          aria-label={`Carácter ${index + 1} de ${length}`}
          className={`mc-code-cell${hasError ? ' mc-code-cell--error' : ''}`}
        />
      ))}
    </div>
  );
}
