import { defineCard } from "../define.js";

// Dragon's Maze (DGM). EDHREC rank 13535.
//
// Rulings:
//   Trait Doctoring's effect changes only the text printed on the permanent. It can't change
//     words found in abilities it's been granted.
//   You choose what word you're changing and what word you're changing it to as Trait Doctoring
//     resolves.
//   If the basic land type of a land is changed, the associated mana ability of that land will
//     also change, but its name will not.
//
// Whim of Volrath's text change, with cipher: the copy a combat-damage trigger lets its
// controller cast changes the text again, its words chosen anew.

export default defineCard({
  name: "Trait Doctoring",
  manaCost: "{U}",
  colors: ["U"],
  types: ["sorcery"],
  text:
    "Change the text of target permanent by replacing all instances of one color word with another or one basic land type with another until end of turn.\n" +
    "Cipher (Then you may exile this spell card encoded on a creature you control. Whenever that creature deals combat damage to a player, its controller may cast a copy of the encoded card without paying its mana cost.)",
  targets: ["permanent"],
  effect: { kind: "change-text", target: 0, words: "color-or-land-type", duration: "end-of-turn" },
  cipher: true,
});
