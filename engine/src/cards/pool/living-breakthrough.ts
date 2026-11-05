import { defineCard } from "../define.js";

// The back face of Inventive Iteration. The mana value is the spell's as the
// trigger resolves, fixed then (an `{ amount }` operand is bound as the
// effect applies); spells already cast aren't touched (the rulings).

const TEXT =
  "Whenever you cast a spell, your opponents can't cast spells with the same mana value as that spell until your next turn.";

export default defineCard({
  name: "Living Breakthrough",
  art: "https://cards.scryfall.io/art_crop/back/e/a/ea6d3242-8059-4203-aa06-58a6a3925eda.jpg",
  colors: ["U"],
  types: ["enchantment", "creature"],
  subtypes: ["Moonfolk"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      targets: [],
      effect: {
        kind: "player-effect",
        duration: "until-your-next-turn",
        cantCast: {
          who: "each-opponent",
          filter: { manaValue: { op: "eq", n: { amount: { manaValueOf: "trigger-object" } } } },
          label: "spells with the same mana value as that spell",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Inventive Iteration", "Living Breakthrough"],
  transform: true,
});
