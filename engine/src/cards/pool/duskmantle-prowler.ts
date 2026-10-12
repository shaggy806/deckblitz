import { defineCard } from "../define.js";

export default defineCard({
  name: "Duskmantle Prowler",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Rogue"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  text: "Haste (This creature can attack and {T} as soon as it comes under your control.)\nExalted (Whenever a creature you control attacks alone, that creature gets +1/+1 until end of turn.)",
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
