import 'react-phone-input-2/lib/style.css';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const container = document.getElementById('google-sheet-inquiry-form');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<App />);
}
