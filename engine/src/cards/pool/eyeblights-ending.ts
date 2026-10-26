import { defineCard } from "../define.js";

export default defineCard({
  name: "Eyeblight's Ending",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["kindred", "instant"],
  subtypes: ["Elf"],
  text: "Destroy target non-Elf creature.",
  targets: [{ kind: "permanent", filter: { type: "creature", notSubtypes: ["Elf"] } }],
  effect: { kind: "destroy", target: 0 },
});
