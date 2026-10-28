import { defineCard } from "../define.js";

// EDHREC rank 12114.
// Makes Treasure → use "Treasure Token".

export default defineCard({
  name: "Cataclysmic Prospecting",
  manaCost: "{X}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Cataclysmic Prospecting deals X damage to each creature. For each mana from a Desert spent to cast this spell, create a tapped Treasure token.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-all", amount: "x", filter: { type: "creature" } },
      {
        kind: "create-token",
        token: "Treasure Token",
        count: { manaSpentOf: "source", from: { subtype: "Desert" } },
        tapped: true,
      },
    ],
  },
});
