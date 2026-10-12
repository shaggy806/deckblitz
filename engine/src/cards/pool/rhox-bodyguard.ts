import { defineCard } from "../define.js";

export default defineCard({
  name: "Rhox Bodyguard",
  manaCost: "{3}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Rhino", "Monk", "Soldier"],
  power: 2,
  toughness: 3,
  text: "Exalted (Whenever a creature you control attacks alone, that creature gets +1/+1 until end of turn.)\nWhen this creature enters, you gain 3 life.",
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
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: "When this creature enters, you gain 3 life.",
    },
  ],
});
