import { defineCard } from "../define.js";

// EDHREC rank 29383.

const TEXT = "When this creature enters, sacrifice it unless you discard a creature card.";

export default defineCard({
  name: "Hidden Horror",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // With no creature card in hand the discard can't be chosen, so it's
      // as though declined: sacrificed.
      effect: {
        kind: "may",
        prompt: "Discard a creature card to keep Hidden Horror?",
        effect: { kind: "discard", target: "you", amount: 1, filter: { type: "creature" } },
        else: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
