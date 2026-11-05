import { defineCard } from "../define.js";

// EDHREC rank 6988.

export default defineCard({
  name: "Planewide Celebration",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Choose four. You may choose the same mode more than once.\n• Create a 2/2 Citizen creature token that's all colors.\n• Return target permanent card from your graveyard to your hand.\n• Proliferate.\n• You gain 4 life.",
  targets: [],
  castModal: {
    minModes: 4,
    maxModes: 4,
    repeatModes: true,
    modes: [
      {
        text: "Create a 2/2 Citizen creature token that's all colors.",
        effect: { kind: "create-token", token: "All-Color Citizen Token", count: 1 },
      },
      {
        text: "Return target permanent card from your graveyard to your hand.",
        targets: [
          {
            kind: "card-in-graveyard",
            whose: "you",
            filter: { typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"] },
          },
        ],
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      { text: "Proliferate.", effect: { kind: "proliferate" } },
      { text: "You gain 4 life.", effect: { kind: "gain-life", amount: 4 } },
    ],
  },
});
