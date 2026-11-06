import { defineCard } from "../define.js";

// EDHREC rank 31191.

export default defineCard({
  name: "Khaaaaaaaaaaaannn!",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Khaaaaaaaaaaaannn! deals twice X damage to target creature. If that creature would die this turn, exile it instead.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: { product: [2, "x"] }, target: 0 },
      { kind: "exile-if-dies-this-turn", target: 0 },
    ],
  },
});
