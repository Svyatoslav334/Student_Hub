import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAuthStore } from './store/authStore';
import { useNewsNotifications } from './hooks/useNewsNotifications';

function App() {
  const loadUser = useAuthStore((state) => state.loadUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  
  useNewsNotifications(isAuthenticated);

  return <RouterProvider router={router} />;
}

export default App;