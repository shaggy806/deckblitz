import { defineCard } from "../define.js";

// EDHREC rank 8193. "1/1" is a targeting requirement, checked as it's
// activated and again as it resolves (the ruling) — a target filter.

export default defineCard({
  name: "Pendelhaven",
  colors: [],
  supertypes: ["legendary"],
  types: ["land"],
  text: "{T}: Add {G}.\n{T}: Target 1/1 creature gets +1/+2 until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 1 },
      resolve: null,
      text: "{T}: Add {G}.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [
        {
          kind: "permanent",
          filter: { type: "creature", power: { op: "eq", n: 1 }, toughness: { op: "eq", n: 1 } },
        },
      ],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "{T}: Target 1/1 creature gets +1/+2 until end of turn.",
    },
  ],
});
