import { defineCard } from "../define.js";

// EDHREC rank 21795.
//
// An intervening-if (rule 603.4): no trigger without a blue permanent, and
// nothing on resolution if there's none then.

const TEXT =
  "At the beginning of your upkeep, if you control a blue permanent, you may create a token that's a copy of this creature.";

export default defineCard({
  name: "Mirror-Sigil Sergeant",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Rhino", "Soldier"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "controls", filter: { colors: ["U"] }, atLeast: 1 },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Create a token that's a copy of Mirror-Sigil Sergeant?",
        effect: { kind: "create-token-copy", of: "source", count: 1, who: "you" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
