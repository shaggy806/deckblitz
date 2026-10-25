import { defineCard } from "../define.js";

// EDHREC rank 18782.
//
// Rulings:
//   [2014-11-24] Count the number of cards in your graveyard as Rakshasa’s Disdain resolves to
//     determine how much mana the controller of the target spell must pay to avoid the spell being
//     countered. Rakshasa’s Disdain is still on the stack at this time and won’t count toward this
//     number.

export default defineCard({
  name: "Rakshasa's Disdain",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell unless its controller pays {1} for each card in your graveyard.",
  targets: ["spell"],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [{ payGeneric: { graveyardSize: "you" }, text: "Pay {X}." }],
    otherwise: { kind: "counter", target: 0 },
  },
});
