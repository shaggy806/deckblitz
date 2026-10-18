import { defineCard } from "../define.js";

// EDHREC rank 23439.

export default defineCard({
  name: "Molten Rebuke",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Choose one or both —\n• Molten Rebuke deals 5 damage to target creature or planeswalker.\n• Destroy target Equipment.",
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: "Molten Rebuke deals 5 damage to target creature or planeswalker.",
        targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
        effect: { kind: "damage", amount: 5, target: 0 },
      },
      {
        text: "Destroy target Equipment.",
        targets: [{ kind: "permanent", whose: "any", filter: { subtype: "Equipment" } }],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});
