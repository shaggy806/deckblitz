import { defineCard } from "../define.js";

// EDHREC rank 11331.

export default defineCard({
  name: "Coordinated Maneuver",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Choose one —\n• Coordinated Maneuver deals damage equal to the number of creatures you control to target creature or planeswalker.\n• Destroy target enchantment.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Coordinated Maneuver deals damage equal to the number of creatures you control to target creature or planeswalker.",
        targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
        effect: { kind: "damage", target: 0, amount: { countOf: { type: "creature", controlledBy: "you" } } },
      },
      {
        text: "Destroy target enchantment.",
        targets: ["enchantment"],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});
