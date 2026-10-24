import { defineCard } from "../define.js";

export default defineCard({
  name: "Goblin Racketeer",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 4,
  toughness: 2,
  text: "Whenever this creature attacks, you may goad target creature defending player controls. (Until your next turn, that creature attacks each combat if able and attacks a player other than you if able.)",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-defending-player-controls"],
      effect: { kind: "may", prompt: "Goad the target creature?", effect: { kind: "goad", target: 0 } },
      resolve: null,
      text: "Whenever this creature attacks, you may goad target creature defending player controls.",
    },
  ],
});
