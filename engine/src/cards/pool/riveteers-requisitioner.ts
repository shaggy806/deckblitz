import { defineCard } from "../define.js";

// Streets of New Capenna.
//
// Blitz is Star Athlete's `blitz` field: the haste, the "when this creature
// dies, draw a card" and the end-step sacrifice ride on the cast (rule
// 702.152a), so a copy of it gets none of them (the ruling).
const DIES_TEXT =
  'When this creature dies, create a Treasure token. (It\'s an artifact with "{T}, Sacrifice this token: Add one mana of any color.")';
const BLITZ_TEXT =
  'Blitz {2}{R} (If you cast this spell for its blitz cost, it gains haste and "When this creature dies, draw a card." Sacrifice it at the beginning of the next end step.)';

export default defineCard({
  name: "Riveteers Requisitioner",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Rogue"],
  power: 3,
  toughness: 1,
  text: `${DIES_TEXT}\n${BLITZ_TEXT}`,
  blitz: { cost: "{2}{R}" },
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: "When this creature dies, create a Treasure token.",
    },
  ],
});
