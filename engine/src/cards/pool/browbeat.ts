import { defineCard } from "../define.js";

// "Any player may have Browbeat deal 5 damage to them": a rhystic `unless`
// (`chooser: "any-player"`, from the active player in turn order) whose one
// option is `takeDamage`. If no one does, the target draws.

export default defineCard({
  name: "Browbeat",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Any player may have Browbeat deal 5 damage to them. If no one does, target player draws three cards.",
  targets: ["player"],
  effect: {
    kind: "unless",
    chooser: "any-player",
    options: [{ takeDamage: 5, text: "Have Browbeat deal 5 damage to you" }],
    otherwise: { kind: "draw", amount: 3, target: 0 },
  },
});
