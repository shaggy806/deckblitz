import { defineCard } from "../define.js";

// EDHREC rank 14327.
// Makes Knight → use "Knight Token".

export default defineCard({
  name: "Righteous Confluence",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Choose three. You may choose the same mode more than once.\n• Create a 2/2 white Knight creature token with vigilance.\n• Exile target enchantment.\n• You gain 5 life.",
  castModal: {
    minModes: 3,
    maxModes: 3,
    repeatModes: true,
    modes: [
      {
        text: "Create a 2/2 white Knight creature token with vigilance.",
        effect: { kind: "create-token", token: "Knight Token", count: 1 },
      },
      {
        text: "Exile target enchantment.",
        targets: ["enchantment"],
        effect: { kind: "exile", target: 0 },
      },
      { text: "You gain 5 life.", effect: { kind: "gain-life", amount: 5 } },
    ],
  },
});
