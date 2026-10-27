import { defineCard } from "../define.js";

export default defineCard({
  name: "Urborg Emissary",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 1,
  kicker: { cost: "{1}{U}" },
  text: "Kicker {1}{U} (You may pay an additional {1}{U} as you cast this spell.)\nWhen this creature enters, if it was kicked, return target permanent to its owner's hand.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["permanent"],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: "When this creature enters, if it was kicked, return target permanent to its owner's hand.",
      condition: { kind: "self-kicked" },
    },
  ],
});
