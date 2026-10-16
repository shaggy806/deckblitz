import { defineCard } from "../define.js";

// Disguise {2}{B/R}{B/R} (rule 702.168). A face-down Informant has no
// abilities, so it deals no damage if it dies face down.

const DIES_TEXT = "When this creature dies, it deals 2 damage to any target.";

export default defineCard({
  name: "Shady Informant",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Ogre", "Rogue"],
  power: 4,
  toughness: 2,
  text: `${DIES_TEXT}\nDisguise {2}{B/R}{B/R} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)`,
  morph: { keyword: "disguise", cost: "{2}{B/R}{B/R}" },
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
