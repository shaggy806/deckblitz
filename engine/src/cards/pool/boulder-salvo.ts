import { defineCard } from "../define.js";

export default defineCard({
  name: "Boulder Salvo",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  alternativeCost: {
    mana: "{1}{R}",
    keyword: "surge",
    condition: { kind: "cast-this-turn", who: "you", atLeast: 1 },
  },
  text: "Surge {1}{R} (You may cast this spell for its surge cost if you or a teammate has cast another spell this turn.)\nBoulder Salvo deals 4 damage to target creature.",
  targets: ["creature"],
  effect: { kind: "damage", amount: 4, target: 0 },
});
