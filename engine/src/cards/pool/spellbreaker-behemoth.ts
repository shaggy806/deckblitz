import { defineCard } from "../define.js";

// Rulings: a creature spell's power on the stack is its printed power (or its
// CDA's) — anthems apply only on the battlefield; a counterspell still
// resolves, it just doesn't counter the spell.

export default defineCard({
  name: "Spellbreaker Behemoth",
  manaCost: "{1}{R}{G}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 5,
  toughness: 5,
  cantBeCountered: true,
  text: "This spell can't be countered.\nCreature spells you control with power 5 or greater can't be countered.",
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { type: "creature", power: { op: "gte", n: 5 } }, cantBeCountered: true },
      text: "Creature spells you control with power 5 or greater can't be countered.",
    },
  ],
});
