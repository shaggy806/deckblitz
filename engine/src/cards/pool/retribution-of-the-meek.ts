import { defineCard } from "../define.js";

// Visions (VIS). EDHREC rank 12750. Damnation's shape, narrowed to power 4 or greater.

export default defineCard({
  name: "Retribution of the Meek",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Destroy all creatures with power 4 or greater. They can't be regenerated.",
  targets: [],
  effect: {
    kind: "destroy-all",
    filter: { type: "creature", power: { op: "gte", n: 4 } },
    cantBeRegenerated: true,
  },
});
