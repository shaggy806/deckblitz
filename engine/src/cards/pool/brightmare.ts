import { defineCard } from "../define.js";

// The life is the target's power as the ability resolves, tapped already or
// not (its rulings); with no target chosen, nothing.

const ENTER_TEXT = "When this creature enters, tap up to one target creature. You gain life equal to that creature's power.";

export default defineCard({
  name: "Brightmare",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Unicorn"],
  power: 2,
  toughness: 3,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "gain-life", amount: { powerOf: 0 } },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
