import { Theme } from './settings/types';
import { BillingInvoicing } from './components/generated/BillingInvoicing';

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

  return <BillingInvoicing />;
}

export default App;
