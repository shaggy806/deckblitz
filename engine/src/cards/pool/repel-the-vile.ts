import { defineCard } from "../define.js";

export default defineCard({
  name: "Repel the Vile",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Choose one —\n• Exile target creature with power 4 or greater.\n• Exile target enchantment.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Exile target creature with power 4 or greater.",
        targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 4 } } }],
        effect: { kind: "exile", target: 0 },
      },
      {
        text: "Exile target enchantment.",
        targets: ["enchantment"],
        effect: { kind: "exile", target: 0 },
      },
    ],
  },
});
