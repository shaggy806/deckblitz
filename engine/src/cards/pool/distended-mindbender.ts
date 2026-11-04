import { defineCard } from "../define.js";

// The two filters can't both describe one card, and a hand holding only one kind gives up only that
// one (rule 609.3). Both go in the one discard.

export default defineCard({
  name: "Distended Mindbender",
  manaCost: "{8}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Insect"],
  power: 5,
  toughness: 5,
  emerge: { cost: "{5}{B}{B}" },
  text: "Emerge {5}{B}{B} (You may cast this spell by sacrificing a creature and paying the emerge cost reduced by that creature's mana value.)\nWhen you cast this spell, target opponent reveals their hand. You choose from it a nonland card with mana value 3 or less and a card with mana value 4 or greater. That player discards those cards.",
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: ["opponent"],
      effect: {
        kind: "discard-chosen",
        target: 0,
        oneEach: {
          filters: [{ notTypes: ["land"], manaValue: { op: "lte", n: 3 } }, { manaValue: { op: "gte", n: 4 } }],
          text: "a nonland card with mana value 3 or less and a card with mana value 4 or greater",
        },
      },
      resolve: null,
      text: "When you cast this spell, target opponent reveals their hand. You choose from it a nonland card with mana value 3 or less and a card with mana value 4 or greater. That player discards those cards.",
    },
  ],
});
