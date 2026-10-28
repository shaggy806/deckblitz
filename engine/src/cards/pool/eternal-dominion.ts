import { defineCard } from "../define.js";

// EDHREC rank 14741. Epic's copies (rule 702.50a) search again each upkeep,
// a new target each time if its controller likes.

export default defineCard({
  name: "Eternal Dominion",
  manaCost: "{7}{U}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Search target opponent's library for an artifact, creature, enchantment, or land card. Put that card onto the battlefield under your control. Then that player shuffles.\nEpic (For the rest of the game, you can't cast spells. At the beginning of each of your upkeeps, copy this spell except for its epic ability. You may choose a new target for the copy.)",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "search-library",
        whose: { target: 0 },
        filter: { typesAnyOf: ["artifact", "creature", "enchantment", "land"] },
        destination: "battlefield",
        min: 0,
        max: 1,
      },
      { kind: "epic" },
    ],
  },
});
