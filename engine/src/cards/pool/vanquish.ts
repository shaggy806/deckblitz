import { defineCard } from "../define.js";

export default defineCard({
  name: "Vanquish",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target blocking creature.",
  targets: [{ kind: "permanent", filter: { blocking: true, type: "creature" } }],
  effect: { kind: "destroy", target: 0 },
});
