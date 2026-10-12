import { defineCard } from "../define.js";

export default defineCard({
  name: "Waveskimmer Aven",
  manaCost: "{2}{G}{W}{U}",
  colors: ["W", "U", "G"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nExalted (Whenever a creature you control attacks alone, that creature gets +1/+1 until end of turn.)",
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "trigger-object",
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Exalted",
    },
  ],
});
