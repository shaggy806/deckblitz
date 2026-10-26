import { defineCard } from "../define.js";

// EDHREC rank 19391. Avatar of Slaughter's shape, narrowed to your creatures.
//
// Rulings:
//   [2013-01-24] Hellraiser Goblin's ability also affects itself. If it enters before combat, it
//     will have to attack that combat if able.
//   [2013-01-24] If, during your declare attackers step, a creature you control is tapped or is
//     affected by a spell or ability that says it can't attack, then it doesn't attack. If there's
//     a cost associated with having a creature attack, you aren't forced to pay that cost, so it
//     doesn't have to attack in that case either.

const TEXT = "Creatures you control have haste and attack each combat if able.";

export default defineCard({
  name: "Hellraiser Goblin",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Berserker"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you" } },
      grantKeywords: ["haste"],
      restrictions: ["must-attack"],
      text: TEXT,
    },
  ],
});
