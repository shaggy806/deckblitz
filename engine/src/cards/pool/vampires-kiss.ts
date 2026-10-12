import { defineCard } from "../define.js";

export default defineCard({
  name: "Vampire's Kiss",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player loses 2 life and you gain 2 life. Create two Blood tokens. (They're artifacts with \"{1}, {T}, Discard a card, Sacrifice this token: Draw a card.\")",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        effects: [{ kind: "lose-life", amount: 2, target: 0 }, { kind: "gain-life", amount: 2 }],
      },
      { kind: "create-token", token: "Blood Token", count: 2 },
    ],
  },
});
