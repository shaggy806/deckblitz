import { defineCard } from "../define.js";

// EDHREC rank 16015. Earthquake at instant speed.

export default defineCard({
  name: "Fault Line",
  manaCost: "{X}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Fault Line deals X damage to each creature without flying and each player.",
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: "x" },
      { kind: "damage", amount: "x", who: "each-player" },
    ],
  },
});
