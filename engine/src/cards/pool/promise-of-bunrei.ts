import { defineCard } from "../define.js";

// EDHREC rank 12034.
//
// Rulings:
//   [2018-03-16] Promise of Bunrei's ability will trigger multiple times if multiple creatures die
//     at once, but it will only be sacrificed once. You'll get only four Spirit tokens.
//
// `sacrifice-source`'s `then` is the "if you do": a second trigger finds the
// enchantment already gone and makes nothing (the ruling).
const TEXT =
  "When a creature you control dies, sacrifice this enchantment. If you do, create four 1/1 colorless Spirit creature tokens.";

export default defineCard({
  name: "Promise of Bunrei",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "sacrifice-source",
        then: { kind: "create-token", token: "Spirit Token (Colorless)", count: 4 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
