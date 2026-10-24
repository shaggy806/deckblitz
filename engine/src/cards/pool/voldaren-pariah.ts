import { defineCard } from "../define.js";

// EDHREC rank 12377.
//
// Rulings:
//   [2016-07-13] If the targeted opponent doesn't control three creatures as the triggered ability
//     of Abolisher of Bloodlines resolves, that player sacrifices as many creatures as able.
//   [2022-12-08] If you choose not to cast a card with madness when the madness triggered ability
//     resolves, it's put into your graveyard.
//
// "Sacrifice three other creatures" is Akul the Unrepentant's cost
// (`otherOnly` keeps the Pariah out of its own sacrifice).

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
