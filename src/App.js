
import './App.css';
import { ThemeProvider } from './components/Context/ThemeContext';
import Pages from './route/pages';

function App() {
  return (
    <div className="App">
      <ThemeProvider>
      <Pages/>
      </ThemeProvider>
    </div>
  );
}

export default App;
