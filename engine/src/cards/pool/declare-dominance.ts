import { defineCard } from "../define.js";

// EDHREC rank 20218.
//
// Rulings:
//   A creature that can't block it (tapped, say) doesn't; a blocking cost
//   need not be paid.

const TEXT = "Target creature gets +3/+3 until end of turn. All creatures able to block it this turn do so.";

export default defineCard({
  name: "Declare Dominance",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
      { kind: "restrict", target: 0, restrictions: ["must-be-blocked"] },
    ],
  },
});
