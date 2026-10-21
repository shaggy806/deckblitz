import { defineCard } from "../define.js";

// Ravnica Allegiance. Team Avatar's ability: X is counted as the trigger
// resolves (the ruling), and "alone" is the declaration (attacks-alone).
const TEXT =
  "Whenever a creature you control attacks alone, it gets +X/+X until end of turn, where X is the number of creatures you control.";

export default defineCard({
  name: "Angelic Exaltation",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "trigger-object",
        power: { countOf: { type: "creature", controlledBy: "you" } },
        toughness: { countOf: { type: "creature", controlledBy: "you" } },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
