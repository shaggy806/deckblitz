import { defineCard } from "../define.js";

export default defineCard({
  name: "Outrider of Jhess",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
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
