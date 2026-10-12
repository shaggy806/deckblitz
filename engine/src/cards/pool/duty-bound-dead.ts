import { defineCard } from "../define.js";

export default defineCard({
  name: "Duty-Bound Dead",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton"],
  power: 0,
  toughness: 2,
  text: "Exalted (Whenever a creature you control attacks alone, that creature gets +1/+1 until end of turn.)\n{3}{B}: Regenerate this creature. (The next time this creature would be destroyed this turn, instead tap it, remove it from combat, and heal all damage on it.)",
  activated: [
    {
      cost: { mana: "{3}{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{3}{B}: Regenerate this creature.",
    },
  ],
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
