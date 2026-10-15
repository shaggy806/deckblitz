import { defineCard } from "../define.js";

// EDHREC rank 23241.
// Screeching Soulbreaker's attack trigger, word for word.

const TEXT = "Whenever Boomerang attacks, he deals 1 damage to each opponent and you gain 1 life.";

export default defineCard({
  name: "Boomerang, Blade Flinger",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Villain"],
  power: 1,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
