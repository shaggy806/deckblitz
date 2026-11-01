import { defineCard } from "../define.js";

export default defineCard({
  name: "Grab the Prize",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, discard a card.\nDraw two cards. If the discarded card wasn't a land card, Grab the Prize deals 2 damage to each opponent.",
  additionalCost: { discard: 1 },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2 },
      {
        kind: "conditional",
        condition: { kind: "discarded", filter: { notTypes: ["land"] } },
        then: { kind: "damage", amount: 2, who: "each-opponent" },
      },
    ],
  },
});
