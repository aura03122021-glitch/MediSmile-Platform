import { Theme } from './settings/types';
import { AppointmentBooking } from './components/generated/AppointmentBooking';

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

  return <AppointmentBooking />;
}

export default App;
