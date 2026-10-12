import { defineCard } from "../define.js";

export default defineCard({
  name: "Glory Bearers",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Human", "Cleric"],
  power: 3,
  toughness: 4,
  text: "Whenever another creature you control attacks, it gets +0/+1 until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "trigger-object",
        power: 0,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Whenever another creature you control attacks, it gets +0/+1 until end of turn.",
    },
  ],
});
