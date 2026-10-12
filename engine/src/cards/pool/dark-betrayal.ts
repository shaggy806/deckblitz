import { defineCard } from "../define.js";

export default defineCard({
  name: "Dark Betrayal",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target black creature.",
  targets: [{ kind: "permanent", filter: { colors: ["B"], type: "creature" } }],
  effect: { kind: "destroy", target: 0 },
});
