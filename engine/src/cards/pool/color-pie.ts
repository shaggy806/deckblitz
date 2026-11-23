import { defineCard } from "../define.js";

const PIE_TEXT =
  "{2}, {T}, Sacrifice this artifact: You gain 3 life. Draw a card. Exile up to one target card from a graveyard. This artifact deals 1 damage to each opponent. Target player adds one mana of any color.";

export default defineCard({
  name: "Color Pie",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Food"],
  text: PIE_TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [{ kind: "optional", of: { kind: "card-in-graveyard" } }, "player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 3 },
          { kind: "draw", amount: 1 },
          { kind: "exile", target: 0 },
          { kind: "damage", amount: 1, who: "each-opponent" },
          { kind: "add-mana", mana: "any-color", amount: 1, target: 1 },
        ],
      },
      resolve: null,
      text: PIE_TEXT,
    },
  ],
});
