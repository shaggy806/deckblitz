import { defineCard } from "../define.js";

export default defineCard({
  name: "Agate Assault",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Choose one —\n• Agate Assault deals 4 damage to target creature. If that creature would die this turn, exile it instead.\n• Exile target artifact.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Agate Assault deals 4 damage to target creature. If that creature would die this turn, exile it instead.",
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "damage", amount: 4, target: 0 },
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
