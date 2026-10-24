import { defineCard } from "../define.js";

// Cast with no targets it still gains the life; with targets that are all
// illegal it doesn't resolve at all (the ruling, rule 608.2b).
export default defineCard({
  name: "Tandem Tactics",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Up to two target creatures each get +1/+2 until end of turn. You gain 2 life.",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 2, duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: 1, toughness: 2, duration: "end-of-turn" },
      { kind: "gain-life", amount: 2 },
    ],
  },
});
