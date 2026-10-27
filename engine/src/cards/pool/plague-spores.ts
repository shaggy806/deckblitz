import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 31059. One instruction over both targets, so
// they're destroyed at once.
export default defineCard({
  name: "Plague Spores",
  manaCost: "{4}{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: "Destroy target nonblack creature and target land. They can't be regenerated.",
  targets: ["nonblack-creature", "land"],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "destroy", target: 0, cantBeRegenerated: true },
      { kind: "destroy", target: 1, cantBeRegenerated: true },
    ],
  },
});
