import { defineCard } from "../define.js";

// Return to Ravnica. EDHREC rank 28679.
//
// Rulings:
//   [2012-10-01] Dark Revenant's ability isn't optional. However, if Dark Revenant leaves the
//     graveyard before its ability resolves, it won't be put on top of its owner's library.
//
// The trigger object is found only in the graveyard it went to (rule 400.7) —
// Arashin Sovereign's shape, without the choice.
const DIES_TEXT = "When this creature dies, put it on top of its owner's library.";

export default defineCard({
  name: "Dark Revenant",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "put-on-library", target: "trigger-object", position: "top" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
