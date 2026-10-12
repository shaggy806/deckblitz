import { defineCard } from "../define.js";

export default defineCard({
  name: "Plummet",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Destroy target creature with flying.",
  targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
  effect: { kind: "destroy", target: 0 },
});
