import { defineCard } from "../define.js";

export default defineCard({
  name: "Improvised Act",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "You may discard a card. If you do, draw a card.",
  effect: {
    kind: "may",
    prompt: "Discard a card to draw a card?",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "discard", target: "you", amount: 1 },
        {
          kind: "conditional",
          condition: { kind: "this-way", what: "discarded" },
          then: { kind: "draw", amount: 1 },
        },
      ],
    },
  },
  prepareSpellOnly: true,
});
