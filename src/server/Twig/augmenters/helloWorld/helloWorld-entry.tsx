import React from "react";
import { createRoot } from "react-dom/client";
import "./helloWorld-entry.css";
import { Card } from "@leafygreen-ui/card";
import { H1 } from "@leafygreen-ui/typography";

// Expose a global function to render cluster metrics charts
declare global {
  interface Window {
    renderHelloWorld: (containerId: string) => void;
  }
}

const MicroUI = () => {
  return (
    <Card>
      <H1>Hello World</H1>
    </Card>
  );
};

window.renderHelloWorld = (containerId: string) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id "${containerId}" not found`);
    return;
  }

  const root = createRoot(container);
  root.render(<MicroUI />);
};
