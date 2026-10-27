import { defineCard } from "../define.js";

// Apocalypse (APC). EDHREC rank 27722. Leeching Bite's shape, at 2.

export default defineCard({
  name: "Consume Strength",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  types: ["instant"],
  text: "Target creature gets +2/+2 until end of turn. Another target creature gets -2/-2 until end of turn.",
  targets: ["creature", { kind: "other", of: "creature", than: { slots: [0] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: -2, toughness: -2, duration: "end-of-turn" },
    ],
  },
});
