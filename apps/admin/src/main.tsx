import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider, theme } from "antd";
import App from "./App";

// Dark theme "Cosmic" — senada dengan brand 4IGeneration (navy + neon violet).
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#7c3aed",
          colorInfo: "#7c3aed",
          colorBgBase: "#070b18",
          colorBgContainer: "#0f1424",
          colorBgElevated: "#151b30",
          borderRadius: 10,
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        },
        components: {
          Layout: { siderBg: "#0a0f1f", headerBg: "#0f1424", bodyBg: "#070b18" },
          Menu: { darkItemBg: "#0a0f1f", darkItemSelectedBg: "#7c3aed33", darkItemSelectedColor: "#c4b5fd" },
          Table: { headerBg: "#151b30" },
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>,
);
