import { defineCard } from "../define.js";

export default defineCard({
  name: "Bubbling Cauldron",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "{1}, {T}, Sacrifice a creature: You gain 4 life.\n{1}, {T}, Sacrifice a creature named Festering Newt: Each opponent loses 4 life. You gain life equal to the life lost this way.",
  activated: [
    {
      cost: { mana: "{1}", tap: true, sacrifice: { filter: { type: "creature" } } },
      targets: [],
      effect: { kind: "gain-life", amount: 4 },
      resolve: null,
      text: "{1}, {T}, Sacrifice a creature: You gain 4 life.",
    },
    {
      cost: { mana: "{1}", tap: true, sacrifice: { filter: { type: "creature", name: "Festering Newt" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 4, who: "each-opponent" },
          { kind: "gain-life", amount: { lifeLostThisWay: true, who: "each-opponent" } },
        ],
      },
      resolve: null,
      text: "{1}, {T}, Sacrifice a creature named Festering Newt: Each opponent loses 4 life. You gain life equal to the life lost this way.",
    },
  ],
});
