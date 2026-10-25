import { defineCard } from "../define.js";

export default defineCard({
  name: "Tasigur's Cruelty",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Delve (Each card you exile from your graveyard while casting this spell pays for {1}.)\nEach opponent discards two cards.",
  delve: true,
  effect: { kind: "discard", target: "each-opponent", amount: 2 },
});
