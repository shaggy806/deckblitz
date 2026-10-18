import { defineCard } from "../define.js";

// EDHREC rank 14447. March of the Machine.

export default defineCard({
  name: "Shatter the Source",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["instant"],
  convoke: true,
  text:
    "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\n" +
    "Choose one —\n" +
    "• Shatter the Source deals 6 damage to target creature, planeswalker, or battle.\n" +
    "• Destroy target artifact.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Shatter the Source deals 6 damage to target creature, planeswalker, or battle.",
        targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker", "battle"] } }],
        effect: { kind: "damage", amount: 6, target: 0 },
      },
      {
        text: "Destroy target artifact.",
        targets: ["artifact"],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});
