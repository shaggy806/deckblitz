import { defineCard } from "../define.js";

// Legends. EDHREC rank 27219.
//
// Rulings:
//   [2004-10-04] If you have two or more Legionnaires, they can all attack.
//
// Every creature you control that is neither named Akron Legionnaire nor an
// artifact can't attack (Evil Eye of Orms-by-Gore's shape).

export default defineCard({
  name: "Akron Legionnaire",
  manaCost: "{6}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Giant", "Soldier"],
  power: 8,
  toughness: 4,
  text: "Except for creatures named Akron Legionnaire and artifact creatures, creatures you control can't attack.",
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", notName: "Akron Legionnaire", notTypes: ["artifact"] },
      },
      restrictions: ["cant-attack"],
      text: "Except for creatures named Akron Legionnaire and artifact creatures, creatures you control can't attack.",
    },
  ],
});
