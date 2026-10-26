import { defineCard } from "../define.js";

// EDHREC rank 29802.

export default defineCard({
  name: "Scorching Winds",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Cast this spell only during the declare attackers step and only if you've been attacked this step.\nScorching Winds deals 1 damage to each attacking creature.",
  castOnlyIf: { kind: "attacked-this-step" },
  targets: [],
  effect: { kind: "damage-all", amount: 1, filter: { type: "creature", attacking: true } },
});
