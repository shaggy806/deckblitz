import { defineCard } from "../define.js";

// "Can't have hexproof" takes every "hexproof from" with it (rule 702.11e).

const HAVE_TEXT = "Creatures you control have hexproof.";
const CANT_TEXT = "Creatures your opponents control lose hexproof and can't have or gain hexproof.";

export default defineCard({
  name: "Archetype of Endurance",
  manaCost: "{6}{G}{G}",
  colors: ["G"],
  types: ["enchantment", "creature"],
  subtypes: ["Boar"],
  power: 6,
  toughness: 5,
  text: `${HAVE_TEXT}\n${CANT_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantKeywords: ["hexproof"],
      text: HAVE_TEXT,
    },
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "opponent" } },
      cantHaveKeywords: ["hexproof"],
      text: CANT_TEXT,
    },
  ],
});
