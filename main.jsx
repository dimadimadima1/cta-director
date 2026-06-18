import React from "react";
import { createRoot } from "react-dom/client";
import CTADirector from "./CTABuilder.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CTADirector />
  </React.StrictMode>
);
