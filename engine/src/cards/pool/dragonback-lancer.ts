import { defineCard } from "../define.js";

export default defineCard({
  name: "Dragonback Lancer",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nMobilize 1 (Whenever this creature attacks, create a tapped and attacking 1/1 red Warrior creature token. Sacrifice it at the beginning of the next end step.)",
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
