import { defineCard } from "../define.js";

// EDHREC rank 13807.
//
// Rulings:
//   If you Donate an Aura, it stays where it is, but the targeted player now controls it.

export default defineCard({
  name: "Donate",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Target player gains control of target permanent you control.",
  targets: ["player", { kind: "permanent", whose: "you", filter: {} }],
  effect: { kind: "gain-control", target: 1, who: { target: 0 }, untilEndOfTurn: false },
});
