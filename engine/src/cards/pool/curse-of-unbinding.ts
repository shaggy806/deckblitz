import { defineCard } from "../define.js";

// EDHREC rank 7264. The enchanted player (the active player in their upkeep)
// reveals until a creature card; it enters under the Curse's controller's
// control (the ruling: not necessarily the enchanted player), the rest go to
// that player's graveyard. Telemin Performance's shape.

const TEXT =
  "At the beginning of enchanted player's upkeep, that player reveals cards from the top of their library until they reveal a creature card. Put that card onto the battlefield under your control. That player puts the rest of the revealed cards into their graveyard.";

export default defineCard({
  name: "Curse of Unbinding",
  manaCost: "{6}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  text: `Enchant player\n${TEXT}`,
  targets: ["player"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "attached" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "active-player",
        effect: {
          kind: "reveal-until",
          whose: "that-player",
          filter: { type: "creature" },
          put: "battlefield",
          underYourControl: true,
          rest: "graveyard",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
