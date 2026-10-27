import { defineCard } from "../define.js";

// Rulings:
//   [2004-10-04] If you have more than one of these on the battlefield, the cost reduction is
//     cumulative.
//   [2008-08-01] You apply cost reduction effects after other cost modifiers, so it can reduce
//     additional costs or alternative costs if they include {W} and/or {B}.
//   [2008-08-01] If a spell has hybrid mana symbols in its mana cost, you choose which half you
//     will be paying before determining the total cost. If you choose to pay such a cost with {W}
//     or {B}, Edgewalker can reduce that part of the cost.

export default defineCard({
  name: "Edgewalker",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: "Cleric spells you cast cost {W}{B} less to cast. This effect reduces only the amount of colored mana you pay. (For example, if you cast a Cleric spell with mana cost {1}{W}, it costs {1} to cast.)",
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { subtype: "Cleric" }, caster: "you", reduceColored: "{W}{B}", coloredOnly: true },
      text: "Cleric spells you cast cost {W}{B} less to cast. This effect reduces only the amount of colored mana you pay.",
    },
  ],
});
