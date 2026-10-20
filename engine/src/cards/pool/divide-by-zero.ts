import { defineCard } from "../define.js";
import { learn } from "../helpers.js";

// EDHREC rank 17119.
//
// Rulings:
//   [2021-04-16] If an effect returns a copy of a spell to its owner's hand, the copy ceases to
//     exist.
//
// Venser, Shaper Savant's shape: one target slot that takes a spell or a
// permanent, returned from whichever zone it's in.
export default defineCard({
  name: "Divide by Zero",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target spell or permanent with mana value 1 or greater to its owner's hand.\nLearn. (You may reveal a Lesson card you own from outside the game and put it into your hand, or discard a card to draw a card.)",
  targets: [{ kind: "spell-or-permanent", filter: { manaValue: { op: "gte", n: 1 } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0, from: "stack" },
      { kind: "return-to-hand", target: 0 },
      learn(),
    ],
  },
});
