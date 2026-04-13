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
let intervalId = null;

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

function initRive(options) {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  counter = 0;
  propsEl.textContent = "";

  const r = new Rive({
    ...options,
    canvas: canvasEl,
    artboard: "main",
    stateMachines: "State Machine 1",
    autoplay: true,
    autoBind: true,
    onLoad: () => onRiveLoaded(r),
    onLoadError: options._onLoadError,
  });
}

function onRiveLoaded(r) {
  log("Rive file loaded!");

  const vmi = r.viewModelInstance;
  if (!vmi) {
    log(
      "Loaded but no viewModelInstance found.\nautoBind may have failed - check artboard/viewModel names."
    );
    return;
  }

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

    for (const { handle } of numberProps) {
      handle.value = counter;
    }

    for (const { handle } of stringProps) {
      handle.value = textValues[counter % textValues.length];
    }

    const lines = [];
    for (const { name, handle } of numberProps) {
      lines.push(`${name}: ${handle.value}`);
    }
    for (const { name, handle } of stringProps) {
      lines.push(`${name}: "${handle.value}"`);
    }
    logProps(`Tick ${counter}\n${lines.join("\n")}`);
  }, 2000);
}

// Handle file input
function loadFromFile(file) {
  if (!file) return;
  log("Loading from file...");
  file.arrayBuffer().then((buffer) => initRive({ buffer }));
}

fileInput.addEventListener("change", (e) => loadFromFile(e.target.files[0]));

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
  loadFromFile(e.dataTransfer.files[0]);
});

// Try loading sources in order: local file, then CDN
const SOURCES = [
  "/fit/counter_test.riv",
  "https://public.rive.app/community/runtime-files/uUM5778BPk60bDnCvu0Uig.riv",
];

let sourceIndex = 0;

function tryNextSource() {
  if (sourceIndex >= SOURCES.length) {
    log(
      "Could not load .riv file automatically.\n\nDownload it from:\nhttps://rive.app/s/uUM5778BPk60bDnCvu0Uig/?runtime=rive-renderer\n\nThen drop it onto the canvas or click 'Choose .riv file'."
    );
    return;
  }
  const src = SOURCES[sourceIndex++];
  log(`Trying: ${src}`);
  initRive({ src, _onLoadError: () => tryNextSource() });
}

tryNextSource();
