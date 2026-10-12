import { defineCard } from "../define.js";

export default defineCard({
  name: "Overwhelming Surge",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Choose one or both —\n• Overwhelming Surge deals 3 damage to target creature.\n• Destroy target noncreature artifact.",
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: "Overwhelming Surge deals 3 damage to target creature.",
        targets: ["creature"],
        effect: { kind: "damage", amount: 3, target: 0 },
      },
      {
        text: "Destroy target noncreature artifact.",
        targets: [{ kind: "permanent", filter: { type: "artifact", notTypes: ["creature"] } }],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});
