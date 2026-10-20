import { defineCard } from "../define.js";

// EDHREC rank 16459.
//
// The dies trigger reads its power as it last existed on the battlefield
// (the ruling); 0 or less deals nothing.

const HASTE_TEXT = "As long as this creature is equipped, it has haste.";
const DIES_TEXT = "When this creature dies, it deals damage equal to its power to any target.";

export default defineCard({
  name: "Fireblade Charger",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 1,
  toughness: 1,
  text: `${HASTE_TEXT}\n${DIES_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { equipped: true } },
      grantKeywords: ["haste"],
      text: HASTE_TEXT,
    },
  ],
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
