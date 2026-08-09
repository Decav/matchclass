import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Q1Toast } from './q1-toast';

describe('Q1Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('muestra el mensaje mientras está montado', () => {
    render(<Q1Toast message="Cambios guardados" onDismiss={vi.fn()} />);
    expect(screen.getByRole('status')).toHaveTextContent('Cambios guardados');
  });

  it('llama a onDismiss una sola vez transcurrido durationMs (default 1500ms)', () => {
    const onDismiss = vi.fn();
    render(<Q1Toast message="Cambios guardados" onDismiss={onDismiss} />);

    vi.advanceTimersByTime(1499);
    expect(onDismiss).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('respeta un durationMs custom', () => {
    const onDismiss = vi.fn();
    render(<Q1Toast message="Cambios guardados" onDismiss={onDismiss} durationMs={500} />);

    vi.advanceTimersByTime(500);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
