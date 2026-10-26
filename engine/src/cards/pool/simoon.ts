import { defineCard } from "../define.js";

export default defineCard({
  name: "Simoon",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["instant"],
  text: "Simoon deals 1 damage to each creature target opponent controls.",
  targets: ["opponent"],
  effect: { kind: "damage-all", filter: { type: "creature" }, amount: 1, controlledByTarget: 0 },
});
