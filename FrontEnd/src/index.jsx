import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx"; // App.jsx로 변경

createRoot(document.getElementById("app")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
