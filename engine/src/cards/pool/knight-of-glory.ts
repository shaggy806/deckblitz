import { defineCard } from "../define.js";

export default defineCard({
  name: "Knight of Glory",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 1,
  text: "Protection from black (This creature can't be blocked, targeted, dealt damage, or enchanted by anything black.)\nExalted (Whenever a creature you control attacks alone, that creature gets +1/+1 until end of turn.)",
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
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["B"] },
      text: "Protection from black",
    },
  ],
});
