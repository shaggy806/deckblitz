import { defineCard } from "../define.js";

export default defineCard({
  name: "Expel",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Exile target tapped creature.",
  targets: [{ kind: "permanent", filter: { tapped: true, type: "creature" } }],
  effect: { kind: "exile", target: 0 },
});
