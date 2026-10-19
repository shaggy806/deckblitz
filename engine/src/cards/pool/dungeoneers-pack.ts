import { defineCard } from "../define.js";

// EDHREC rank 10787.

export default defineCard({
  name: "Dungeoneer's Pack",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "This artifact enters tapped.\n{2}, {T}, Sacrifice this artifact: You take the initiative, gain 3 life, draw a card, and create a Treasure token. Activate only as a sorcery. (A Treasure token is an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")",
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "take-initiative" },
          { kind: "gain-life", amount: 3 },
          { kind: "draw", amount: 1 },
          { kind: "create-token", token: "Treasure Token", count: 1 },
        ],
      },
      resolve: null,
      text: "{2}, {T}, Sacrifice this artifact: You take the initiative, gain 3 life, draw a card, and create a Treasure token. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This artifact enters tapped.",
    },
  ],
});
