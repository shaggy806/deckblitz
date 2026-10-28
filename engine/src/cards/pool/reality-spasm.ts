import { defineCard } from "../define.js";

// Each mode is exactly X targets (an any-number group in a mode — Word of
// Binding's shape per mode).
export default defineCard({
  name: "Reality Spasm",
  manaCost: "{X}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Choose one —\n• Tap X target permanents.\n• Untap X target permanents.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        targets: [{ kind: "any-number", of: "permanent", min: "x", max: "x" }],
        effect: { kind: "for-each-target", from: 0, effect: { kind: "tap", target: 0 } },
        text: "Tap X target permanents.",
      },
      {
        targets: [{ kind: "any-number", of: "permanent", min: "x", max: "x" }],
        effect: { kind: "for-each-target", from: 0, effect: { kind: "untap", target: 0 } },
        text: "Untap X target permanents.",
      },
    ],
  },
});
