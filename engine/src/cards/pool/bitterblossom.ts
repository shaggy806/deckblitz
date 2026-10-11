import { defineCard } from "../define.js";

// A Kindred Enchantment — Faerie (rule 308): not a
// creature, but a Faerie on the battlefield and a Faerie card everywhere
// else, so a "Faerie spell" cast trigger sees it.

const TEXT = "At the beginning of your upkeep, you lose 1 life and create a 1/1 black Faerie Rogue creature token with flying.";

export default defineCard({
  name: "Bitterblossom",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["kindred", "enchantment"],
  subtypes: ["Faerie"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "you" },
          { kind: "create-token", token: "Faerie Rogue Token", count: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
