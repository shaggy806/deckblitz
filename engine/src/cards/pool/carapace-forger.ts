import { defineCard } from "../define.js";

// EDHREC rank 30481. Chrome Steed's shape.

const TEXT = "Metalcraft — This creature gets +2/+2 as long as you control three or more artifacts.";

export default defineCard({
  name: "Carapace Forger",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Artificer"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [{ affects: { scope: "self" }, condition: { kind: "metalcraft" }, grantPt: [2, 2], text: TEXT }],
});
