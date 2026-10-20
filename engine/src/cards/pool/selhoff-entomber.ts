import { defineCard } from "../define.js";

const DRAW_TEXT = "{T}, Discard a creature card: Draw a card.";

export default defineCard({
  name: "Selhoff Entomber",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 1,
  toughness: 3,
  text: DRAW_TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, discard: { count: 1, filter: { type: "creature" } } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
