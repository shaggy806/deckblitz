import { defineCard } from "../define.js";

// EDHREC rank 4974.
//
// Rulings:
//   [2023-06-16] To move a counter from one permanent to another, the counter is removed from the
//     first permanent and put on the second. Any abilities that care about a counter being removed
//     from or put onto a permanent will apply.

export default defineCard({
  name: "Goldberry, River-Daughter",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Nymph"],
  power: 1,
  toughness: 3,
  text: "{T}: Move a counter of each kind not on Goldberry from another target permanent you control onto Goldberry.\n{U}, {T}: Move one or more counters from Goldberry onto another target permanent you control. If you do, draw a card.",
  activated: [
    {
      // One of each kind the target has and Goldberry hasn't, as it resolves.
      cost: { mana: null, tap: true },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: {} } }],
      effect: { kind: "move-counters", from: 0, to: "source", amount: "each-kind-missing" },
      resolve: null,
      text: "{T}: Move a counter of each kind not on Goldberry from another target permanent you control onto Goldberry.",
    },
    {
      // How many of each kind is chosen as it resolves — at least one in
      // all; with none on Goldberry, none moves and no card is drawn.
      cost: { mana: "{U}", tap: true },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: {} } }],
      effect: {
        kind: "move-counters",
        from: "source",
        to: 0,
        amount: "one-or-more",
        ifMoved: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: "{U}, {T}: Move one or more counters from Goldberry onto another target permanent you control. If you do, draw a card.",
    },
  ],
});
