import { defineCard } from "../define.js";

// EDHREC rank 15969. Marvel Super Heroes Commander.
//
// "If you control another artifact creature" is an intervening-if (rule
// 603.4), asked as it triggers and as it resolves; Iron Man himself doesn't
// count (`excludeSelf`).
const ANTHEM_TEXT = "Other artifact creatures you control get +1/+1.";
const ATTACK_TEXT = "Whenever Iron Man attacks, if you control another artifact creature, draw a card.";

export default defineCard({
  name: "Iron Man, Modern Marvel",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Hero"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying (This creature can't be blocked except by creatures with flying or reach.)\n${ANTHEM_TEXT}\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { types: ["artifact", "creature"], controlledBy: "you" }, excludeSelf: true },
      grantPt: [1, 1],
      text: ANTHEM_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "controls", filter: { types: ["artifact", "creature"] }, atLeast: 1, excludeSelf: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
