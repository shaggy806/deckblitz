import { defineCard } from "../define.js";

// EDHREC rank 16936.

const SNAKES_TEXT = "Other Snake creatures you control get +1/+0.";
const WARRIOR_TEXT = "Whenever a Warrior you control deals combat damage to a creature, destroy that creature at end of combat.";

export default defineCard({
  name: "Sosuke, Son of Seshiro",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Snake", "Warrior"],
  power: 3,
  toughness: 4,
  text: `${SNAKES_TEXT}\n${WARRIOR_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Snake" },
      grantPt: [1, 0],
      text: SNAKES_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "you-control", filter: { subtype: "Warrior" }, to: "creature", combat: true },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { step: "end-combat" },
        effect: { kind: "destroy", target: "trigger-recipient" },
        text: "Destroy that creature.",
      },
      resolve: null,
      text: WARRIOR_TEXT,
    },
  ],
});
