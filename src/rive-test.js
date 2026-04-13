import { Rive } from "@rive-app/canvas";

const statusEl = document.getElementById("status");
const propsEl = document.getElementById("properties");
const canvasEl = document.getElementById("rive-canvas");
const fileInput = document.getElementById("file-input");

function log(msg) {
  statusEl.textContent = msg;
  console.log(msg);
}

function logProps(msg) {
  propsEl.textContent = msg;
}

let counter = 0;
const textValues = [
  "Hello Rive!",
  "Data Binding",
  "View Model Test",
  "Counter Update",
  "Dynamic Text",
  "Rive is great",
  "Animating...",
  "Live Update",
];

let intervalId = null;

function startRive(options) {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  counter = 0;

  const r = new Rive({
    ...options,
    canvas: canvasEl,
    artboard: "main",
    stateMachines: "State Machine 1",
    autoplay: true,
    autoBind: true,
    onLoad: () => {
      log("Rive file loaded!");

      const vmi = r.viewModelInstance;
      if (!vmi) {
        log(
          "Loaded but no viewModelInstance found.\nautoBind may have failed — check artboard/viewModel names."
        );
        return;
      }

      // Enumerate all properties on the view model instance
      const properties = vmi.properties;
      const propInfo = properties
        .map((p) => `  ${p.name} (${p.type})`)
        .join("\n");
      log(`View Model: ${vmi.viewModelName}\nProperties:\n${propInfo}`);

      // Collect number and string property handles
      const numberProps = [];
      const stringProps = [];

      for (const prop of properties) {
        if (prop.type === "number") {
          const handle = vmi.number(prop.name);
          if (handle) numberProps.push({ name: prop.name, handle });
        } else if (prop.type === "string") {
          const handle = vmi.string(prop.name);
          if (handle) stringProps.push({ name: prop.name, handle });
        }
      }

      if (numberProps.length === 0 && stringProps.length === 0) {
        log(
          `View Model: ${vmi.viewModelName}\nProperties:\n${propInfo}\n\nNo number or string properties found to update.`
        );
        return;
      }

      // Update every 2 seconds
      intervalId = setInterval(() => {
        counter++;

        // Increment all number properties
        for (const { handle } of numberProps) {
          handle.value = counter;
        }

        // Cycle text on all string properties
        for (const { handle } of stringProps) {
          handle.value = textValues[counter % textValues.length];
        }

        // Display current values
        const lines = [];
        for (const { name, handle } of numberProps) {
          lines.push(`${name}: ${handle.value}`);
        }
        for (const { name, handle } of stringProps) {
          lines.push(`${name}: "${handle.value}"`);
        }
        logProps(`Tick ${counter}\n${lines.join("\n")}`);
      }, 2000);
    },
    onLoadError: () => {
      log(
        "Failed to load Rive file from URL.\n\nPlease download the .riv file from the Rive share link,\nthen either:\n  1. Drop it onto this page, or\n  2. Click 'Choose .riv file' below."
      );
    },
  });
}

function loadFromBuffer(buffer) {
  log("Loading from file...");
  startRive({ buffer });
}

// Handle file input
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  file.arrayBuffer().then(loadFromBuffer);
});

// Handle drag and drop on the canvas
canvasEl.addEventListener("dragover", (e) => {
  e.preventDefault();
  canvasEl.style.borderColor = "#6366f1";
});
canvasEl.addEventListener("dragleave", () => {
  canvasEl.style.borderColor = "#333";
});
canvasEl.addEventListener("drop", (e) => {
  e.preventDefault();
  canvasEl.style.borderColor = "#333";
  const file = e.dataTransfer.files[0];
  if (!file) return;
  file.arrayBuffer().then(loadFromBuffer);
});

// Try loading from local public folder first, then from CDN
log("Attempting to load .riv file...");
startRive({ src: "/fit/counter_test.riv" });
