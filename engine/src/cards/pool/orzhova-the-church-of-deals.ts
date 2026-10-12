import { defineCard } from "../define.js";

export default defineCard({
  name: "Orzhova, the Church of Deals",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{3}{W}{B}, {T}: Target player loses 1 life and you gain 1 life.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{3}{W}{B}", tap: true },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [{ kind: "lose-life", amount: 1, target: 0 }, { kind: "gain-life", amount: 1 }],
      },
      resolve: null,
      text: "{3}{W}{B}, {T}: Target player loses 1 life and you gain 1 life.",
    },
  ],
});
