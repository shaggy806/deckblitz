import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 27526.
//
// Ruling: untapped during the untap step, it triggers then and goes on the
// stack as the upkeep begins, alongside the upkeep triggers.

const TEXT = "Whenever this creature becomes untapped, you may have target player discard a card.";

export default defineCard({
  name: "Hollowsage",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-untapped", who: "self" },
      targets: ["player"],
      effect: {
        kind: "may",
        prompt: "Have the target player discard a card?",
        effect: { kind: "discard", target: 0, amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
