import { defineCard } from "../define.js";

const HEROIC = "Heroic — Whenever you cast a spell that targets this creature, draw a card.";

export default defineCard({
  name: "Triton Fortune Hunter",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Soldier"],
  power: 2,
  toughness: 2,
  text: HEROIC,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: HEROIC,
    },
  ],
});
