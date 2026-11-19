import { ThemeProvider } from './context/ThemeContext';
import { AdminLayout } from './components/layout/AdminLayout';

function App() {
  return (
    <ThemeProvider>
      <AdminLayout />
    </ThemeProvider>
  );
}

export default App;
