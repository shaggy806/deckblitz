import { defineCard } from "../define.js";

// EDHREC rank 30085.
//
// Rulings:
//   [2021-03-19] Because damage remains marked on a creature until the damage is removed as the
//     turn ends, nonlethal damage dealt to Gathan Raiders while your hand is empty may become
//     lethal if a card is put into your hand during that turn.

export default defineCard({
  name: "Gathan Raiders",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 3,
  morph: { keyword: "morph", cost: "", also: { discard: { count: 1 } }, text: "Discard a card" },
  text: "Hellbent — This creature gets +2/+2 as long as you have no cards in hand.\nMorph—Discard a card. (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "hand-size", atMost: 0 },
      grantPt: [2, 2],
      text: "Hellbent — This creature gets +2/+2 as long as you have no cards in hand.",
    },
  ],
});
