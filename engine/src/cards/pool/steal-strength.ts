import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 30816.
//
// "Another target creature": two slots of one group, so the second can't be the first
// (`distinctTargets`, rule 601.2c) — Leeching Bite's shape.

export default defineCard({
  name: "Steal Strength",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets +1/+1 until end of turn. Another target creature gets -1/-1 until end of turn.",
  targets: distinctTargets(2, "creature"),
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: -1, toughness: -1, duration: "end-of-turn" },
    ],
  },
});
