import { Outlet } from 'react-router-dom';
import { Toaster } from '../components/ui/sonner';
import { AppProvider } from '../context/AppContext';

export function RootLayout() {
  return (
    <AppProvider>
      <Toaster />
      <Outlet />
    </AppProvider>
  );
}
