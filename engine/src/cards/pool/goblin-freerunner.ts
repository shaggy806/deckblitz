import { defineCard } from "../define.js";

export default defineCard({
  name: "Goblin Freerunner",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior", "Ally"],
  power: 3,
  toughness: 2,
  keywords: ["menace"],
  alternativeCost: {
    mana: "{1}{R}",
    keyword: "surge",
    condition: { kind: "cast-this-turn", who: "you", atLeast: 1 },
  },
  text: "Surge {1}{R} (You may cast this spell for its surge cost if you or a teammate has cast another spell this turn.)\nMenace (This creature can't be blocked except by two or more creatures.)",
});
