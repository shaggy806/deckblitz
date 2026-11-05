import { defineCard } from "../define.js";

// EDHREC rank 7479.

export default defineCard({
  name: "Green Goblin, Revenant",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Human", "Villain"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "deathtouch"],
  text: "Flying, deathtouch\nWhenever Green Goblin attacks, discard a card. Then draw a card for each card you've discarded this turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 1 },
          { kind: "draw", amount: { turnHistory: "discarded" } },
        ],
      },
      resolve: null,
      text: "Whenever Green Goblin attacks, discard a card. Then draw a card for each card you've discarded this turn.",
    },
  ],
});
