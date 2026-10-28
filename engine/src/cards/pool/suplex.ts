import { defineCard } from "../define.js";

// EDHREC rank 4277.

export default defineCard({
  name: "Suplex",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Choose one —\n• Suplex deals 3 damage to target creature. If that creature would die this turn, exile it instead.\n• Exile target artifact.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Suplex deals 3 damage to target creature. If that creature would die this turn, exile it instead.",
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "damage", amount: 3, target: 0 },
            { kind: "exile-if-dies-this-turn", target: 0 },
          ],
        },
      },
      {
        text: "Exile target artifact.",
        targets: ["artifact"],
        effect: { kind: "exile", target: 0 },
      },
    ],
  },
});
