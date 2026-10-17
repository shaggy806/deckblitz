import { defineCard } from "../define.js";

// EDHREC rank 22790.

export default defineCard({
  name: "Haradrim Spearmaster",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 3,
  keywords: ["reach"],
  text: "Reach\nAt the beginning of combat on your turn, another target creature you control gets +1/+0 until end of turn.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "At the beginning of combat on your turn, another target creature you control gets +1/+0 until end of turn.",
    },
  ],
});
