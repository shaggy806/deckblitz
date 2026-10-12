import { defineCard } from "../define.js";

export default defineCard({
  name: "Reckless Stormseeker",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Werewolf"],
  power: 2,
  toughness: 3,
  keywords: ["daybound"],
  text: "At the beginning of combat on your turn, target creature you control gets +1/+0 and gains haste until end of turn.\nDaybound (If a player casts no spells during their own turn, it becomes night next turn.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "At the beginning of combat on your turn, target creature you control gets +1/+0 and gains haste until end of turn.",
    },
  ],
  faces: ["Reckless Stormseeker", "Storm-Charged Slasher"],
  transform: true,
});
