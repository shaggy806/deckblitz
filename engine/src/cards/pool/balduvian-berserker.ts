import { defineCard } from "../define.js";
import { enlist, ENLIST_TEXT } from "../helpers.js";

const DIES_TEXT = "When this creature dies, it deals damage equal to its power to any target.";

export default defineCard({
  name: "Balduvian Berserker",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Kor", "Berserker"],
  power: 1,
  toughness: 3,
  text: `${ENLIST_TEXT}\n${DIES_TEXT}`,
  static: [enlist()],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
