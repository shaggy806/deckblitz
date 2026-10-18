import { defineCard } from "../define.js";

// EDHREC rank 11588.

export default defineCard({
  name: "Distorted Curiosity",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Corrupted — This spell costs {2} less to cast if an opponent has three or more poison counters.\nDraw two cards.",
  selfCostReduction: {
    condition: { kind: "player-counters", counter: "poison", who: "opponent", atLeast: 3 },
    reduceGeneric: 2,
  },
  targets: [],
  effect: { kind: "draw", amount: 2 },
});
