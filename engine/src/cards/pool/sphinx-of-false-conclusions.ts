import { defineCard } from "../define.js";

export default defineCard({
  name: "Sphinx of False Conclusions",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx", "Illusion"],
  power: 4,
  toughness: 2,
  keywords: ["flash", "flying"],
  text: "Flash\nFlying\nWhenever this creature attacks, draw a card, then discard a card.\nWhen this creature dies, if it isn't a token, create a token that's a copy of it.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: "Whenever this creature attacks, draw a card, then discard a card.",
    },
    {
      // Vaultborn Tyrant's dies trigger, with no copy exception.
      trigger: { on: "dies", who: "self" },
      condition: { kind: "source", filter: { token: false } },
      targets: [],
      effect: { kind: "create-token-copy", of: "source", count: 1, who: "you" },
      resolve: null,
      text: "When this creature dies, if it isn't a token, create a token that's a copy of it.",
    },
  ],
});
