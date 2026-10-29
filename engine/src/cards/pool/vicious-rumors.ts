import { defineCard } from "../define.js";

// EDHREC rank 4409.
//
// In the ruling's order: the damage, then each opponent chooses a card face
// down in turn order and all are discarded at once (rule 101.4), then each
// mills a card, then you gain 1 life.
export default defineCard({
  name: "Vicious Rumors",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Vicious Rumors deals 1 damage to each opponent. Each opponent discards a card, then mills a card. You gain 1 life.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 1, who: "each-opponent" },
      { kind: "discard", target: "each-opponent", amount: 1 },
      { kind: "mill", target: "each-opponent", amount: 1 },
      { kind: "gain-life", amount: 1 },
    ],
  },
});
