import { defineCard } from "../define.js";

// EDHREC rank 24361.

export default defineCard({
  name: "Join Forces",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Untap up to two target creatures. They each get +2/+2 until end of turn.",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap", target: 0 },
      { kind: "untap", target: 1 },
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: 2, toughness: 2, duration: "end-of-turn" },
    ],
  },
});
