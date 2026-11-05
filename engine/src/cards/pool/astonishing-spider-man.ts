import { defineCard } from "../define.js";

const TEXT =
  "Whenever Astonishing Spider-Man attacks, you may discard your hand. If you do, draw a card for each card you've discarded this turn.";

export default defineCard({
  name: "Astonishing Spider-Man",
  manaCost: "{2}{U/R}{U/R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Human", "Hero"],
  power: 4,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard your hand, then draw a card for each card you've discarded this turn?",
        effect: { kind: "discard-hand", who: "you" },
        then: { kind: "draw", amount: { turnHistory: "discarded" } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
