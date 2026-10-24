import { defineCard } from "../define.js";

// EDHREC rank 18204.
//
// Rulings:
//   [2015-02-25] Because Magmatic Chasm’s effect doesn’t change the characteristics of any
//     permanents, the set of creatures affected by Magmatic Chasm is constantly updated.
//     Creatures without flying that enter the battlefield later in the turn won’t be able to
//     block.
// A `restrict` with a filter is a rule for the rest of the turn (rule 611.2c),
// binding a creature that enters later too.

export default defineCard({
  name: "Magmatic Chasm",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Creatures without flying can't block this turn.",
  targets: [],
  effect: { kind: "restrict", filter: { type: "creature", notKeyword: "flying" }, restrictions: ["cant-block"] },
});
