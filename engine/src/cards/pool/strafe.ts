import { defineCard } from "../define.js";

export default defineCard({
  name: "Strafe",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Strafe deals 3 damage to target nonred creature.",
  targets: [{ kind: "permanent", filter: { notColors: ["R"], type: "creature" } }],
  effect: { kind: "damage", amount: 3, target: 0 },
});
