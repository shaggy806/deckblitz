import { defineCard } from "../define.js";

// EDHREC rank 28034. Mirrodin.
//
// Pillory of the Sleepless's shape: the upkeep trigger is the artifact's own
// (granted), so "you" is the artifact's controller.

const GRANT_TEXT = 'Enchanted artifact has "At the beginning of your upkeep, you lose 2 life."';

export default defineCard({
  name: "Relic Bane",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact\n${GRANT_TEXT}`,
  targets: ["artifact"],
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "upkeep", who: "you" },
          targets: [],
          effect: { kind: "lose-life", amount: 2, who: "you" },
          resolve: null,
          text: "At the beginning of your upkeep, you lose 2 life.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
