import { defineCard } from "../define.js";

// EDHREC rank 17870.

export default defineCard({
  name: "Volcanic Spray",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  flashback: { cost: "{1}{R}" },
  text: "Volcanic Spray deals 1 damage to each creature without flying and each player.\nFlashback {1}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: 1 },
      { kind: "damage", amount: 1, who: "each-player" },
    ],
  },
});
