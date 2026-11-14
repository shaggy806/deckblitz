import { defineCard } from "../define.js";

// EDHREC rank 25870. Two optional creature slots, then two optional player
// slots, each player drawing one.
export default defineCard({
  name: "Donatello's Science Lesson",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Tap up to two target creatures. Up to two target players each draw a card.",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
    { kind: "optional", of: "player" },
    { kind: "optional", of: { kind: "other", of: "player", than: { slots: [2] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "tap", target: 1 },
      { kind: "draw", amount: 1, target: 2 },
      { kind: "draw", amount: 1, target: 3 },
    ],
  },
});
