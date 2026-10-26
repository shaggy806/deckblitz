import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 13429. Hurricane's effect: the damage to
// creatures and players is one simultaneous event.

export default defineCard({
  name: "Squall Line",
  manaCost: "{X}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Squall Line deals X damage to each creature with flying and each player.",
  targets: [],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage-all", filter: { type: "creature", keyword: "flying" }, amount: "x" },
      { kind: "damage", amount: "x", who: "each-player" },
    ],
  },
});
