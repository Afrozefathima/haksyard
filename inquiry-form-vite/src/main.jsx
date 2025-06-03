import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

function mountWidget(containerId = "google-sheet-inquiry-form") {
  const container = document.getElementById(containerId);
  if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(<App />);
  } else {
    console.warn("Mount container not found:", containerId);
  }
}

window.mountEmbedForm = mountWidget;
