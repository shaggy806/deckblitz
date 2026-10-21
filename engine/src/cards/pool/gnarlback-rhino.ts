import { defineCard } from "../define.js";

// Core Set 2020. Legolas, Master Archer's heroic trigger: once per spell
// however many of its targets are this creature, and it resolves first.
const CAST_TEXT = "Whenever you cast a spell that targets this creature, draw a card.";

export default defineCard({
  name: "Gnarlback Rhino",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Rhino"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample (This creature can deal excess combat damage to the player or planeswalker it's attacking.)\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
