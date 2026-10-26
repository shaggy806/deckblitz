import { defineCard } from "../define.js";

// Rulings:
//   [2004-10-04] Must target two different creatures.

export default defineCard({
  name: "Hope and Glory",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Untap two target creatures. Each of them gets +1/+1 until end of turn.",
  targets: ["creature", { kind: "other", of: "creature", than: { slots: [0] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap", target: 0 },
      { kind: "untap", target: 1 },
      { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: 1, toughness: 1, duration: "end-of-turn" },
    ],
  },
});
