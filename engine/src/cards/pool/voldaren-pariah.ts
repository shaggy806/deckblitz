import { defineCard } from "../define.js";

// "Sacrifice three other creatures" — chosen as the cost is paid, kept off
// the Pariah itself by `otherOnly` (Akul the Unrepentant's shape).
const TRANSFORM_TEXT = "Sacrifice three other creatures: Transform this creature.";

export default defineCard({
  name: "Voldaren Pariah",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Horror"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  madness: { cost: "{B}{B}{B}" },
  text: `Flying\n${TRANSFORM_TEXT}\nMadness {B}{B}{B} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { type: "creature" }, count: 3 } },
      otherOnly: true,
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  faces: ["Voldaren Pariah", "Abolisher of Bloodlines"],
  transform: true,
});
