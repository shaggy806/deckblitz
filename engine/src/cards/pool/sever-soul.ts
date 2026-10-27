import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 27384. Vendetta's shape with a gain:
// the toughness is read as the creature last existed on the battlefield.

export default defineCard({
  name: "Sever Soul",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target nonblack creature. It can't be regenerated. You gain life equal to its toughness.",
  targets: ["nonblack-creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0, cantBeRegenerated: true },
      { kind: "gain-life", amount: { toughnessOf: 0 } },
    ],
  },
});
