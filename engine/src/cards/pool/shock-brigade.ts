import { defineCard } from "../define.js";

export default defineCard({
  name: "Shock Brigade",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Soldier"],
  power: 1,
  toughness: 3,
  keywords: ["menace"],
  text: "Menace (This creature can't be blocked except by two or more creatures.)\nMobilize 1 (Whenever this creature attacks, create a tapped and attacking 1/1 red Warrior creature token. Sacrifice it at the beginning of the next end step.)",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Red Warrior Token",
        count: 1,
        tapped: true,
        attacking: "choose",
        sacrificeAtEndStep: true,
      },
      resolve: null,
      text: "Mobilize 1",
    },
  ],
});
