import { defineCard } from "../define.js";

// Ruling: with every target illegal it doesn't resolve, and no Food is made.
export default defineCard({
  name: "Second Breakfast",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Up to two target creatures each get +2/+1 until end of turn. Create a Food token. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 1, duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: 2, toughness: 1, duration: "end-of-turn" },
      { kind: "create-token", token: "Food Token", count: 1 },
    ],
  },
});
