import { defineCard } from "../define.js";

export default defineCard({
  name: "Sanguimancy",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "You draw X cards and you lose X life, where X is your devotion to black. (Each {B} in the mana costs of permanents you control counts toward your devotion to black.)",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: { devotionTo: ["B"] } },
      { kind: "lose-life", amount: { devotionTo: ["B"] }, who: "you" },
    ],
  },
});
