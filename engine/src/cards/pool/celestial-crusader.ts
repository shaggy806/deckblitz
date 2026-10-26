import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 16075.
//
// Split second on a creature spell (Sulfur Elemental's), and Crovax's
// "other white creatures" — every player's.
//
// Rulings:
//   [2021-03-19] If the resolution of a triggered ability involves casting a spell, that spell
//     can't be cast if a spell with split second is on the stack.
//   [2021-03-19] Split second doesn't stop triggered abilities from triggering, such as that of
//     Chalice of the Void. If one does, its controller puts it on the stack and chooses targets
//     for it, if any. Those abilities will resolve as normal.
//   [2021-03-19] Players still get priority while a card with split second is on the stack; their
//     options are just limited to mana abilities and certain special actions.

export default defineCard({
  name: "Celestial Crusader",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  keywords: ["flash", "flying"],
  splitSecond: true,
  text: "Flash\nSplit second (As long as this spell is on the stack, players can't cast spells or activate abilities that aren't mana abilities.)\nFlying\nOther white creatures get +1/+1.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["W"] }, excludeSelf: true },
      grantPt: [1, 1],
      text: "Other white creatures get +1/+1.",
    },
  ],
});
