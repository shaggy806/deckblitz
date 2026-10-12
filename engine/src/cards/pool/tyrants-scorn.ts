import { defineCard } from "../define.js";

export default defineCard({
  name: "Tyrant's Scorn",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["instant"],
  text: "Choose one —\n• Destroy target creature with mana value 3 or less.\n• Return target creature to its owner's hand.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Destroy target creature with mana value 3 or less.",
        targets: [{ kind: "permanent", filter: { type: "creature", manaValue: { op: "lte", n: 3 } } }],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Return target creature to its owner's hand.",
        targets: ["creature"],
        effect: { kind: "return-to-hand", target: 0 },
      },
    ],
  },
});
