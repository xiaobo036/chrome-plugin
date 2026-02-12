import { StrictMode } from "react";
import Popup from "@/Popup/Popup";

import ReactDOM from "react-dom/client";

ReactDOM.createRoot(
  document.getElementById("popup-dom") as HTMLDivElement,
).render(
  <StrictMode>
    <Popup />
  </StrictMode>,
);
