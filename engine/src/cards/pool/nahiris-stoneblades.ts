import { defineCard } from "../define.js";

// Two different creatures: the same one can't be targeted twice for +4/+0
// (the ruling).
export default defineCard({
  name: "Nahiri's Stoneblades",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Up to two target creatures each get +2/+0 until end of turn.",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: 2, toughness: 0, duration: "end-of-turn" },
    ],
  },
});
