import { defineCard } from "../define.js";

// EDHREC rank 22762.
//
// Rulings:
//   [2013-09-15] Savage Surge can target an untapped creature.

export default defineCard({
  name: "Savage Surge",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +2/+2 until end of turn. Untap that creature.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "untap", target: 0 },
    ],
  },
});
