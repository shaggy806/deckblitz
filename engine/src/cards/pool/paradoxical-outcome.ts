import { defineCard } from "../define.js";

// EDHREC rank 6982.
//
// Rulings:
//   [2021-03-19] If a melded or merged permanent is returned to your hand this way, you'll draw a
//     card for each of its components that are cards.
//   [2021-03-19] If you control but don't own some of the target permanents, they won't count when
//     determining how many cards you draw.
//
// One return over the whole group, so they leave together; the draw counts
// what this spell returned to a hand that is yours — a permanent you
// controlled but don't own went to its owner's (`ownedBy`, the second ruling).
const TEXT =
  "Return any number of target nonland, nontoken permanents you control to their owners' hands. Draw a card for each card returned to your hand this way.";

export default defineCard({
  name: "Paradoxical Outcome",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: TEXT,
  targets: [
    { kind: "any-number", of: { kind: "permanent", whose: "you", filter: { notTypes: ["land"], token: false } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "for-each-target", from: 0, effect: { kind: "return-to-hand", target: 0 }, simultaneous: true },
      { kind: "draw", amount: { thisWay: "returned-to-hand", filter: { ownedBy: "you" } } },
    ],
  },
});
