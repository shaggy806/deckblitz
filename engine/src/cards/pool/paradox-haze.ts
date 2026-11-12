import { defineCard } from "../define.js";

// "Enchanted player's first upkeep each turn" is a `step-begins` trigger with
// `who: "attached"` and the timing wrapper's `firstTimeEachTurn` (the turn's
// upkeep steps counted); that player is the active player, who gets the
// added step (rule 500.10). A skipped upkeep never begins, so nothing
// triggers (the ruling); two Hazes give two added upkeeps.

const TEXT =
  "At the beginning of enchanted player's first upkeep each turn, that player gets an additional upkeep step after this step.";

export default defineCard({
  name: "Paradox Haze",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant player\n${TEXT}`,
  targets: ["player"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "attached", firstTimeEachTurn: true },
      targets: [],
      effect: { kind: "additional-upkeep-step", who: "active-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
