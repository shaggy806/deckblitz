import { defineCard } from "../define.js";

export default defineCard({
  name: "Swift Response",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target tapped creature.",
  targets: [{ kind: "permanent", filter: { tapped: true, type: "creature" } }],
  effect: { kind: "destroy", target: 0 },
});
