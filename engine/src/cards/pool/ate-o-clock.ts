import { defineCard } from "../define.js";

// Playtest card. Each replicate copy does the whole spell again, new target
// and all (rule 702.56).

export default defineCard({
  name: "Ate-o'-Clock",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Populate. Proliferate. Investigate.\nRegenerate target creature.\nReplicate {2}{G} (When you cast this spell, copy it for each time you paid its replicate cost. You may choose new targets for the copy.)",
  targets: ["creature"],
  replicate: { cost: "{2}{G}" },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "populate" },
      { kind: "proliferate" },
      { kind: "create-token", token: "Clue Token", investigate: true, count: 1 },
      { kind: "regenerate", target: 0 },
    ],
  },
});
