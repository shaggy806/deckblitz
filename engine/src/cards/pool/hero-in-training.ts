import { defineCard } from "../define.js";

// EDHREC rank 21295.
//
// "If you control another Hero" is checked as the ability resolves, after the
// draw; this creature itself doesn't count.
const TEXT = "When this creature enters, draw a card. If you control another Hero, you gain 2 life.";

export default defineCard({
  name: "Hero in Training",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "controls", filter: { subtype: "Hero" }, atLeast: 1, excludeSelf: true },
            then: { kind: "gain-life", amount: 2 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
