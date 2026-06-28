import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AppProviders } from './providers';
import { useSettingsStore } from './store/settingsStore';
import AmbientBackground from './components/ui/AmbientBackground';



import CustomCursor from './components/ui/CustomCursor';

function App() {
  const theme = useSettingsStore(state => state.theme);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  return (
    <AppProviders>
      <CustomCursor />
      <AmbientBackground />
      <RouterProvider router={router} />
    </AppProviders>
  );
}

export default App;
