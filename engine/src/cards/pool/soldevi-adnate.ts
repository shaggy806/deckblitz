import { defineCard } from "../define.js";

// EDHREC rank 5872.
//
// Priest of Yawgmoth's shape: a mana ability (rule 605.1a) resolves at once, so
// the creature sacrificed for its cost is read as it last existed (608.2h).
const TEXT =
  "{T}, Sacrifice a black or artifact creature: Add an amount of {B} equal to the sacrificed creature's mana value.";

export default defineCard({
  name: "Soldevi Adnate",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: {
        mana: null,
        tap: true,
        sacrifice: { filter: { type: "creature", anyOf: [{ colors: ["B"] }, { type: "artifact" }] } },
      },
      targets: [],
      effect: { kind: "add-mana", mana: "B", amount: { manaValueOf: "sacrificed" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
