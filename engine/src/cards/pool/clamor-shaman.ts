import { defineCard } from "../define.js";

export default defineCard({
  name: "Clamor Shaman",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 1,
  toughness: 1,
  keywords: ["riot"],
  text: "Riot (This creature enters with your choice of a +1/+1 counter or haste.)\nWhenever this creature attacks, target creature an opponent controls can't block this turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: "Whenever this creature attacks, target creature an opponent controls can't block this turn.",
    },
  ],
});
