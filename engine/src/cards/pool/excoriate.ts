import { defineCard } from "../define.js";

export default defineCard({
  name: "Excoriate",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Exile target tapped creature.",
  targets: [{ kind: "permanent", filter: { tapped: true, type: "creature" } }],
  effect: { kind: "exile", target: 0 },
});
