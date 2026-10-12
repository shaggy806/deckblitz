import { defineCard } from "../define.js";

export default defineCard({
  name: "Sigiled Behemoth",
  manaCost: "{4}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 5,
  toughness: 4,
  text: "Exalted (Whenever a creature you control attacks alone, that creature gets +1/+1 until end of turn.)",
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
