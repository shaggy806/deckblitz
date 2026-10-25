import { defineCard } from "../define.js";

// EDHREC rank 30368. Both targets are required (the ruling): with one
// creature, the spell can't be cast.

export default defineCard({
  name: "Windborne Charge",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Two target creatures you control each get +2/+2 and gain flying until end of turn.",
  targets: ["creature-you-control", { kind: "other", of: "creature-you-control", than: { slots: [0] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 1, keyword: "flying", duration: "end-of-turn" },
    ],
  },
});
