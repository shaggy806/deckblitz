import { defineCard } from "../define.js";

// EDHREC rank 14909.

const DIES_TEXT = 'When this creature dies, create a 1/1 black Rat creature token with "This token can\'t block."';

export default defineCard({
  name: "Harried Spearguard",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Rat Token (Can't Block)", count: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
