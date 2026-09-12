import { Theme } from './settings/types';
import { PatientRecords } from './components/generated/PatientRecords';

let theme: Theme = 'light';

function App() {
  function setTheme(theme: Theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  setTheme(theme);

  return <PatientRecords />;
}

export default App;
