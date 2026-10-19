import { defineCard } from "../define.js";

// Streets of New Capenna.
//
// Gravpack Monoist's tapped token on death, and Star Athlete's `blitz`.
const DIES_TEXT = "When this creature dies, create a tapped 2/2 black Rogue creature token.";
const BLITZ_TEXT =
  'Blitz {3}{B} (If you cast this spell for its blitz cost, it gains haste and "When this creature dies, draw a card." Sacrifice it at the beginning of the next end step.)';

export default defineCard({
  name: "Girder Goons",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 4,
  toughness: 4,
  text: `${DIES_TEXT}\n${BLITZ_TEXT}`,
  blitz: { cost: "{3}{B}" },
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Rogue Token", count: 1, tapped: true },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
