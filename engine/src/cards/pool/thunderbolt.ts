import { defineCard } from "../define.js";

export default defineCard({
  name: "Thunderbolt",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Choose one —\n• Thunderbolt deals 3 damage to target player or planeswalker.\n• Thunderbolt deals 4 damage to target creature with flying.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Thunderbolt deals 3 damage to target player or planeswalker.",
        targets: ["player-or-planeswalker"],
        effect: { kind: "damage", amount: 3, target: 0 },
      },
      {
        text: "Thunderbolt deals 4 damage to target creature with flying.",
        targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
        effect: { kind: "damage", amount: 4, target: 0 },
      },
    ],
  },
});
