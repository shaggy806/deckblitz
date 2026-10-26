import { defineCard } from "../define.js";

export default defineCard({
  name: "Fool's Tome",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Book"],
  text: "{2}, {T}: Draw a card. Activate only if you have no cards in hand.",
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      condition: { kind: "hand-size", atMost: 0 },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{2}, {T}: Draw a card. Activate only if you have no cards in hand.",
    },
  ],
});
