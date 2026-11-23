import { defineCard } from "../define.js";

// No mana cost, so it can only be suspended (rule 118.6), as Ancestral Vision.

const PIZZA_TEXT =
  "{2}, Sacrifice Deep Dish Pizza: Gain 3 life, draw three cards, and Deep Dish Pizza deals 3 damage to each opponent.";

export default defineCard({
  name: "Deep Dish Pizza",
  colors: [],
  types: ["artifact"],
  subtypes: ["Food"],
  suspend: { n: 2, cost: "{2}" },
  text: `Suspend 2—{2} (Deep Dish Pizza has no mana cost and must be suspended.)\n${PIZZA_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 3 },
          { kind: "draw", amount: 3 },
          { kind: "damage", amount: 3, who: "each-opponent" },
        ],
      },
      resolve: null,
      text: PIZZA_TEXT,
    },
  ],
});
