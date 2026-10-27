import { defineCard } from "../define.js";

export default defineCard({
  name: "Choking Tethers",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  cycling: { cost: "{1}{U}" },
  text: "Tap up to four target creatures.\nCycling {1}{U} ({1}{U}, Discard this card: Draw a card.)\nWhen you cycle this card, you may tap target creature.",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0, 1] } } },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0, 1, 2] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "tap", target: 1 },
      { kind: "tap", target: 2 },
      { kind: "tap", target: 3 },
    ],
  },
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Tap target creature?",
        effect: { kind: "tap", target: 0 },
      },
      resolve: null,
      text: "When you cycle this card, you may tap target creature.",
    },
  ],
});
