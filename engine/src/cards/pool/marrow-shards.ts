import { defineCard } from "../define.js";

// EDHREC rank 19763. Sandstorm's shape.
export default defineCard({
  name: "Marrow Shards",
  manaCost: "{W/P}",
  colors: ["W"],
  types: ["instant"],
  text: "({W/P} can be paid with either {W} or 2 life.)\nMarrow Shards deals 1 damage to each attacking creature.",
  targets: [],
  effect: { kind: "damage-all", amount: 1, filter: { type: "creature", attacking: true } },
});
