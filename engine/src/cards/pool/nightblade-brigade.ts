import { defineCard } from "../define.js";

export default defineCard({
  name: "Nightblade Brigade",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Goblin", "Soldier"],
  power: 1,
  toughness: 3,
  keywords: ["deathtouch"],
  text: "Deathtouch\nMobilize 1 (Whenever this creature attacks, create a tapped and attacking 1/1 red Warrior creature token. Sacrifice it at the beginning of the next end step.)\nWhen this creature enters, surveil 1. (Look at the top card of your library. You may put it into your graveyard.)",
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
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: "When this creature enters, surveil 1.",
    },
  ],
});
