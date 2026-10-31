import { defineCard } from "../define.js";

// Ikoria: Lair of Behemoths. EDHREC rank 24525.
//
// Rulings:
//   The targets can't attack, block or have their abilities activated even
//     if the damage to them is prevented — but one that became an illegal
//     target can.
//   Each chosen target must receive at least 1 damage.
//   A copy of the spell had no mana spent on it, so it gets no bonus.
//
// "Until your next turn, those permanents can't attack or block and their
// activated abilities can't be activated" is detain's effect word for word
// (rule 701.35a; Academic Probation), on each target still legal (608.2b).

export default defineCard({
  name: "Mythos of Vadrok",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Mythos of Vadrok deals 5 damage divided as you choose among any number of target creatures and/or planeswalkers. If {W}{U} was spent to cast this spell, until your next turn, those permanents can't attack or block and their activated abilities can't be activated.",
  targets: [
    {
      kind: "any-number",
      of: { kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } },
      max: 5,
    },
  ],
  divided: { total: 5, slot: 0 },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-divided", from: 0 },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpentOfColors: { W: 1, U: 1 } } },
        then: { kind: "for-each-target", from: 0, effect: { kind: "detain", target: 0 } },
      },
    ],
  },
});
