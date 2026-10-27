import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 25069. Domain, read as it resolves.

export default defineCard({
  name: "Tribal Flames",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Domain — Tribal Flames deals X damage to any target, where X is the number of basic land types among lands you control.",
  targets: ["any-target"],
  effect: { kind: "damage", amount: { basicLandTypes: "you" }, target: 0 },
});
