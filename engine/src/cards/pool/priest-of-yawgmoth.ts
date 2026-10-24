import { defineCard } from "../define.js";

// EDHREC rank 21115.
//
// A mana ability (rule 605.1a) resolves at once (605.3b), so the artifact
// sacrificed for its cost is read as it last existed (608.2h), as a spell's
// additional cost is (Metamorphosis).
export default defineCard({
  name: "Priest of Yawgmoth",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Human", "Cleric"],
  power: 1,
  toughness: 2,
  text: "{T}, Sacrifice an artifact: Add an amount of {B} equal to the sacrificed artifact's mana value.",
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { type: "artifact" } } },
      targets: [],
      effect: { kind: "add-mana", mana: "B", amount: { manaValueOf: "sacrificed" } },
      resolve: null,
      text: "{T}, Sacrifice an artifact: Add an amount of {B} equal to the sacrificed artifact's mana value.",
    },
  ],
});
