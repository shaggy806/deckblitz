import { defineCard } from "../define.js";

// EDHREC rank 11626.
//
// Flesh Hooks reads each creature's entry turn (`enteredThisTurn`), live, so
// a creature that entered this turn has double strike for the rest of it,
// Deathleaper included.

const HOOKS_TEXT = "Flesh Hooks — Creatures you control that entered this turn have double strike.";

export default defineCard({
  name: "Deathleaper, Terror Weapon",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Tyranid"],
  power: 3,
  toughness: 3,
  keywords: ["flash", "haste"],
  text: `Flash\nHaste\n${HOOKS_TEXT}`,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", enteredThisTurn: true },
      },
      grantKeywords: ["double-strike"],
      text: HOOKS_TEXT,
    },
  ],
});
