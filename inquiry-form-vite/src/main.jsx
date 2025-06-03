import ReactDOM from "react-dom/client";
import App from "./App";

// Export globally so external HTML can call this
window.mountEmbedForm = function (containerId = "google-sheet-inquiry-form") {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container with ID '${containerId}' not found.`);
    return;
  }
  const root = ReactDOM.createRoot(container);
  root.render(<App />);
};
