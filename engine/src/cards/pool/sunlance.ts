import { defineCard } from "../define.js";

export default defineCard({
  name: "Sunlance",
  manaCost: "{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Sunlance deals 3 damage to target nonwhite creature.",
  targets: [{ kind: "permanent", filter: { notColors: ["W"], type: "creature" } }],
  effect: { kind: "damage", amount: 3, target: 0 },
});
