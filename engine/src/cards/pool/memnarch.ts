import { defineCard } from "../define.js";

// EDHREC rank 7955.
//
// Rulings:
//   [2004-12-01] You can use the first ability on a nonartifact permanent, wait for the ability
//     to resolve, and then use the second ability on that permanent.
//   [2004-12-01] The effects of Memnarch's abilities don't end at end of turn, and they don't end
//     when Memnarch leaves the battlefield. Both effects last until the affected permanent leaves
//     the battlefield.
// Both are `"permanent"` effects on the target, so they outlast Memnarch and end
// only when that permanent leaves (rule 400.7 — a new object).

const ARTIFACT_TEXT =
  "{1}{U}{U}: Target permanent becomes an artifact in addition to its other types. (This effect lasts indefinitely.)";
const CONTROL_TEXT = "{3}{U}: Gain control of target artifact. (This effect lasts indefinitely.)";

export default defineCard({
  name: "Memnarch",
  manaCost: "{7}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Wizard"],
  power: 4,
  toughness: 5,
  text: `${ARTIFACT_TEXT}\n${CONTROL_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{U}{U}", tap: false },
      targets: ["permanent"],
      effect: { kind: "add-types", target: 0, addTypes: ["artifact"], duration: "permanent" },
      resolve: null,
      text: ARTIFACT_TEXT,
    },
    {
      cost: { mana: "{3}{U}", tap: false },
      targets: ["artifact"],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false },
      resolve: null,
      text: CONTROL_TEXT,
    },
  ],
});
