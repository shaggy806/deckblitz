import { defineCard } from "../define.js";

export default defineCard({
  name: "Combat Professor",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Cleric"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nAt the beginning of combat on your turn, target creature you control gets +1/+0 and gains vigilance until end of turn.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "At the beginning of combat on your turn, target creature you control gets +1/+0 and gains vigilance until end of turn.",
    },
  ],
});
