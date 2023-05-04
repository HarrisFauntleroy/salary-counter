import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.scss";
import reportWebVitals from "./reportWebVitals";

const root = createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals(console.log);
