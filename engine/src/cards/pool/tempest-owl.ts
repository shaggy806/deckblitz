import { defineCard } from "../define.js";

const ETB = "When this creature enters, if it was kicked, tap up to three target permanents.";

export default defineCard({
  name: "Tempest Owl",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  kicker: { cost: "{4}{U}" },
  text: `Kicker {4}{U} (You may pay an additional {4}{U} as you cast this spell.)\nFlying\n${ETB}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: [
        { kind: "optional", of: "permanent" },
        { kind: "optional", of: { kind: "other", of: "permanent", than: { slots: [0] } } },
        { kind: "optional", of: { kind: "other", of: "permanent", than: { slots: [0, 1] } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "tap", target: 1 },
          { kind: "tap", target: 2 },
        ],
      },
      resolve: null,
      text: ETB,
    },
  ],
});
