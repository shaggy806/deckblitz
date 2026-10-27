import { defineCard } from "../define.js";

// Browbeat's shape: a rhystic `unless` whose option is `takeDamage`.

export default defineCard({
  name: "Book Burning",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Any player may have Book Burning deal 6 damage to them. If no one does, target player mills six cards.",
  targets: ["player"],
  effect: {
    kind: "unless",
    chooser: "any-player",
    options: [{ takeDamage: 6, text: "Have Book Burning deal 6 damage to you" }],
    otherwise: { kind: "mill", target: 0, amount: 6 },
  },
});
