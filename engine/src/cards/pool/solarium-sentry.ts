import { defineCard } from "../define.js";

// Reality Fracture (FRA). EDHREC rank 20878.

const TEXT = "Whenever an opponent casts a spell with mana value 2 or less, you gain 2 life.";

export default defineCard({
  name: "Solarium Sentry",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Cat", "Soldier"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { manaValue: { op: "lte", n: 2 } } },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
