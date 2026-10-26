import { defineCard } from "../define.js";

const TAP_TEXT = "Whenever a creature you control attacks alone, you may tap target creature.";

export default defineCard({
  name: "Angelic Benediction",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `Exalted (Whenever a creature you control attacks alone, that creature gets +1/+1 until end of turn.)\n${TAP_TEXT}`,
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
      trigger: { on: "attacks-alone", who: "you-control" },
      targets: ["creature"],
      effect: { kind: "may", prompt: "Tap target creature?", effect: { kind: "tap", target: 0 } },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
