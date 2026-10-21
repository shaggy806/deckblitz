import { defineCard } from "../define.js";

export default defineCard({
  name: "Run Afoul",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target opponent sacrifices a creature of their choice with flying.",
  targets: ["opponent"],
  effect: { kind: "sacrifice", who: "target", filter: { type: "creature", keyword: "flying" }, count: 1 },
});
