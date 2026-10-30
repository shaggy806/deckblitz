import { defineCard } from "../define.js";

// Invasion. "Four or more creatures on the battlefield" counts every
// player's; an intervening-if (rule 603.4), asked as the upkeep begins and
// again as it resolves.

const TEXT =
  "At the beginning of your upkeep, if there are four or more creatures on the battlefield, sacrifice this enchantment and destroy all creatures. They can't be regenerated.";

export default defineCard({
  name: "Planar Collapse",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "controls", filter: { type: "creature" }, atLeast: 4, anyController: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice-source" },
          { kind: "destroy-all", filter: { type: "creature" }, cantBeRegenerated: true },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
