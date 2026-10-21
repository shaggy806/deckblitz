import { defineCard } from "../define.js";

// EDHREC rank 24545.

export default defineCard({
  name: "Caligo Skin-Witch",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 3,
  kicker: { cost: "{3}{B}" },
  text: "Kicker {3}{B} (You may pay an additional {3}{B} as you cast this spell.)\nWhen this creature enters, if it was kicked, each opponent discards two cards.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "each-opponent", amount: 2 },
      resolve: null,
      text: "When this creature enters, if it was kicked, each opponent discards two cards.",
      condition: { kind: "self-kicked" },
    },
  ],
});
