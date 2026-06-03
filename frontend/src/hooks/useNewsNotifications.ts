import { useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useNotifications } from './useNotifications';

const POLL_INTERVAL = 60_000; 
const STORAGE_KEY = 'studenthub_last_news_id';

export function useNewsNotifications(enabled = true) {
  const { notify } = useNotifications();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const check = async () => {
      try {
        const res = await api.get('/news', { params: { limit: 5, page: 1 } });
        const items: any[] = res.data.items ?? [];
        if (!items.length) return;

        const lastKnownId = Number(localStorage.getItem(STORAGE_KEY) ?? 0);
        const newest = items[0];

        if (newest.id > lastKnownId) {
          
          const newItems = items.filter((n) => n.id > lastKnownId);

          
          if (lastKnownId > 0) {
            if (newItems.length === 1) {
              notify({
                title: '📰 Нова новина',
                body: newItems[0].title,
                tag: `news-${newItems[0].id}`,
                onClick: () => {
                  window.location.href = `/news/${newItems[0].id}`;
                },
              });
            } else {
              notify({
                title: '📰 Нові новини',
                body: `${newItems.length} нових публікацій на StudentHub`,
                tag: 'news-batch',
                onClick: () => {
                  window.location.href = '/news';
                },
              });
            }
          }

          localStorage.setItem(STORAGE_KEY, String(newest.id));
        }
      } catch {
        
      }
    };

    
    check();

    timerRef.current = setInterval(check, POLL_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [enabled, notify]);
}