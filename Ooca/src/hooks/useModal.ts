import { useLayoutEffect, useRef } from 'react';
export function useModal(session: unknown) {
  const ref = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!session || !dialog) return;
    const trigger = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      document.body.style.overflow = overflow;
      // Native close restores focus. Do not steal a newer focus when its event arrives later.
      if (trigger?.isConnected && (document.activeElement === document.body || dialog.contains(document.activeElement))) {
        trigger.focus({ preventScroll: true });
      }
    };
  }, [session]);
  return ref;
}
export function closeOnBackdrop(event: React.MouseEvent<HTMLDialogElement>) {
  if (event.target !== event.currentTarget) return;
  const box = event.currentTarget.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) event.currentTarget.close();
}
