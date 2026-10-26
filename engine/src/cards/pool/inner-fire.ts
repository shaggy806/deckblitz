import { defineCard } from "../define.js";

// Saviors of Kamigawa. Counted as it resolves, Inner Fire itself on the stack.
export default defineCard({
  name: "Inner Fire",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Add {R} for each card in your hand.",
  targets: [],
  effect: { kind: "add-mana", mana: "R", amount: { cardsInHand: "you" } },
});
