import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 9605.
//
// Savage Ventmaw's persisting mana (`persists` — kept as steps and phases
// end, emptied at cleanup), off a dies trigger.

const DIES_TEXT =
  "When this creature dies, add eight {C}. Until end of turn, you don't lose this mana as steps and phases end.";

export default defineCard({
  name: "Su-Chi Cave Guard",
  manaCost: "{8}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 8,
  toughness: 8,
  keywords: ["vigilance"],
  text:
    "Vigilance\nWard {4} (Whenever this creature becomes the target of a spell or ability an opponent controls, " +
    `counter it unless that player pays {4}.)\n${DIES_TEXT}`,
  triggered: [
    ward({ mana: "{4}" }),
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 8, persists: true },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
