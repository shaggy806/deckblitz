import { defineCard } from "../define.js";

export default defineCard({
  name: "Immolating Glare",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target attacking creature.",
  targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
  effect: { kind: "destroy", target: 0 },
});
