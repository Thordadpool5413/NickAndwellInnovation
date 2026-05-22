import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react', () => ({
  useEffect: (fn: () => void | (() => void)) => { fn(); },
}));

import { useKeyboardShortcuts, useClickOutside, useFocusTrap } from './hooks';

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { addEventListener: vi.fn(), removeEventListener: vi.fn() });
  });

  it('adds keydown event listener to window', () => {
    useKeyboardShortcuts([]);
    expect(window.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('calls callback when matching shortcut is pressed', () => {
    const callback = vi.fn();
    const addEventListener = vi.fn();
    vi.stubGlobal('window', { addEventListener, removeEventListener: vi.fn() });

    useKeyboardShortcuts([{ key: 's', ctrlKey: true, callback }]);

    const handler = addEventListener.mock.calls[0][1];
    const event = { key: 's', ctrlKey: true, metaKey: false, shiftKey: false, preventDefault: vi.fn() };
    handler(event);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('supports meta key as alternative to ctrl', () => {
    const callback = vi.fn();
    const addEventListener = vi.fn();
    vi.stubGlobal('window', { addEventListener, removeEventListener: vi.fn() });

    useKeyboardShortcuts([{ key: 's', ctrlKey: true, callback }]);

    const handler = addEventListener.mock.calls[0][1];
    const event = { key: 's', ctrlKey: false, metaKey: true, shiftKey: false, preventDefault: vi.fn() };
    handler(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not call callback when key does not match', () => {
    const callback = vi.fn();
    const addEventListener = vi.fn();
    vi.stubGlobal('window', { addEventListener, removeEventListener: vi.fn() });

    useKeyboardShortcuts([{ key: 's', ctrlKey: true, callback }]);

    const handler = addEventListener.mock.calls[0][1];
    handler({ key: 'x', ctrlKey: true, metaKey: false, shiftKey: false, preventDefault: vi.fn() });

    expect(callback).not.toHaveBeenCalled();
  });

  it('does not call callback when ctrl key requirement not met', () => {
    const callback = vi.fn();
    const addEventListener = vi.fn();
    vi.stubGlobal('window', { addEventListener, removeEventListener: vi.fn() });

    useKeyboardShortcuts([{ key: 's', ctrlKey: true, callback }]);

    const handler = addEventListener.mock.calls[0][1];
    handler({ key: 's', ctrlKey: false, metaKey: false, shiftKey: false, preventDefault: vi.fn() });

    expect(callback).not.toHaveBeenCalled();
  });

  it('matches shortcut with shift key', () => {
    const callback = vi.fn();
    const addEventListener = vi.fn();
    vi.stubGlobal('window', { addEventListener, removeEventListener: vi.fn() });

    useKeyboardShortcuts([{ key: 'S', shiftKey: true, callback }]);

    const handler = addEventListener.mock.calls[0][1];
    const event = { key: 's', ctrlKey: false, metaKey: false, shiftKey: true, preventDefault: vi.fn() };
    handler(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('performs case-insensitive key matching', () => {
    const callback = vi.fn();
    const addEventListener = vi.fn();
    vi.stubGlobal('window', { addEventListener, removeEventListener: vi.fn() });

    useKeyboardShortcuts([{ key: 'Escape', callback }]);

    const handler = addEventListener.mock.calls[0][1];
    handler({ key: 'escape', ctrlKey: false, metaKey: false, shiftKey: false, preventDefault: vi.fn() });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('supports multiple shortcuts', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const addEventListener = vi.fn();
    vi.stubGlobal('window', { addEventListener, removeEventListener: vi.fn() });

    useKeyboardShortcuts([
      { key: 'a', ctrlKey: true, callback: callback1 },
      { key: 'b', ctrlKey: true, callback: callback2 },
    ]);

    const handler = addEventListener.mock.calls[0][1];
    handler({ key: 'a', ctrlKey: true, metaKey: false, shiftKey: false, preventDefault: vi.fn() });

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).not.toHaveBeenCalled();
  });
});

describe('useClickOutside', () => {
  beforeEach(() => {
    vi.stubGlobal('document', { addEventListener: vi.fn(), removeEventListener: vi.fn() });
  });

  it('adds mousedown event listener to document', () => {
    const ref = { current: null };
    useClickOutside(ref, vi.fn());

    expect(document.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
  });

  it('calls callback when clicking outside the ref element', () => {
    const callback = vi.fn();
    const addEventListener = vi.fn();
    vi.stubGlobal('document', { addEventListener, removeEventListener: vi.fn() });

    const el = { contains: vi.fn().mockReturnValue(false) } as unknown as HTMLElement;
    const ref = { current: el };
    useClickOutside(ref, callback);

    const handler = addEventListener.mock.calls[0][1];
    handler({ target: {} });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(el.contains).toHaveBeenCalled();
  });

  it('does not call callback when clicking inside the ref element', () => {
    const callback = vi.fn();
    const addEventListener = vi.fn();
    vi.stubGlobal('document', { addEventListener, removeEventListener: vi.fn() });

    const el = { contains: vi.fn().mockReturnValue(true) } as unknown as HTMLElement;
    const ref = { current: el };
    useClickOutside(ref, callback);

    const handler = addEventListener.mock.calls[0][1];
    handler({ target: {} });

    expect(callback).not.toHaveBeenCalled();
  });

  it('does not call callback when ref.current is null', () => {
    const callback = vi.fn();
    const addEventListener = vi.fn();
    vi.stubGlobal('document', { addEventListener, removeEventListener: vi.fn() });

    const ref = { current: null };
    useClickOutside(ref, callback);

    const handler = addEventListener.mock.calls[0][1];
    handler({ target: {} });

    expect(callback).not.toHaveBeenCalled();
  });
});

describe('useFocusTrap', () => {
  beforeEach(() => {
    vi.stubGlobal('document', { addEventListener: vi.fn(), removeEventListener: vi.fn() });
  });

  it('does not add event listener when isActive is false', () => {
    const addEventListener = vi.fn();
    vi.stubGlobal('document', { addEventListener, removeEventListener: vi.fn() });

    useFocusTrap(false);

    expect(addEventListener).not.toHaveBeenCalled();
  });

  it('adds keydown event listener when isActive is true', () => {
    const addEventListener = vi.fn();
    vi.stubGlobal('document', { addEventListener, removeEventListener: vi.fn() });

    useFocusTrap(true);

    expect(addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('prevents default on Escape key press', () => {
    const addEventListener = vi.fn();
    vi.stubGlobal('document', { addEventListener, removeEventListener: vi.fn() });

    useFocusTrap(true);

    const handler = addEventListener.mock.calls[0][1];
    const event = { key: 'Escape', preventDefault: vi.fn() };
    handler(event);

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('does not prevent default on non-Escape key press', () => {
    const addEventListener = vi.fn();
    vi.stubGlobal('document', { addEventListener, removeEventListener: vi.fn() });

    useFocusTrap(true);

    const handler = addEventListener.mock.calls[0][1];
    const event = { key: 'Enter', preventDefault: vi.fn() };
    handler(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
