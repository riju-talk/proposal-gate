import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const rootElement = document.getElementById("root");
//rootElement.classList.add("dark");
createRoot(rootElement).render(<App />);