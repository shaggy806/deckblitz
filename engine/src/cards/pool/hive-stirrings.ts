import { defineCard } from "../define.js";

export default defineCard({
  name: "Hive Stirrings",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Create two 1/1 colorless Sliver creature tokens.",
  effect: { kind: "create-token", token: "Sliver Token", count: 2 },
});
