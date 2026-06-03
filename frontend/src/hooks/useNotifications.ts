import { useEffect, useRef, useCallback } from 'react';

interface NotifyOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  onClick?: () => void;
}

export function useNotifications() {
  const permissionRef = useRef<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  useEffect(() => {
    if (typeof Notification === 'undefined') return;

    if (Notification.permission === 'default') {
      Notification.requestPermission().then((perm) => {
        permissionRef.current = perm;
      });
    } else {
      permissionRef.current = Notification.permission;
    }
  }, []);

  const notify = useCallback(({ title, body, icon, tag, onClick }: NotifyOptions) => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;

    
    if (document.visibilityState === 'visible' && document.hasFocus()) return;

    const n = new Notification(title, {
      body,
      icon: icon ?? '/favicon.ico',
      tag,
      badge: '/favicon.ico',
    });

    if (onClick) {
      n.onclick = () => {
        window.focus();
        onClick();
        n.close();
      };
    }

    
    setTimeout(() => n.close(), 6000);

    return n;
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return 'denied' as NotificationPermission;
    const perm = await Notification.requestPermission();
    permissionRef.current = perm;
    return perm;
  }, []);

  return {
    notify,
    requestPermission,
    permission: permissionRef.current,
  };
}