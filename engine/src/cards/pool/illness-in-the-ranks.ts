import { defineCard } from "../define.js";

// EDHREC rank 14518. Virulent Plague's anthem, at -1/-1.
//
// Rulings:
//   [2013-01-24] If an effect creates a creature token that normally has toughness 1, it will
//     enter with toughness 0, be put into its owner's graveyard as a state-based action, and then
//     cease to exist. Any abilities that trigger when a creature enters or dies will trigger.

export default defineCard({
  name: "Illness in the Ranks",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "Creature tokens get -1/-1.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", token: true } },
      grantPt: [-1, -1],
      text: "Creature tokens get -1/-1.",
    },
  ],
});
