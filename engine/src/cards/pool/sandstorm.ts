import { defineCard } from "../define.js";

export default defineCard({
  name: "Sandstorm",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Sandstorm deals 1 damage to each attacking creature.",
  targets: [],
  effect: { kind: "damage-all", amount: 1, filter: { type: "creature", attacking: true } },
});
