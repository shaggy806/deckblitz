import { defineCard } from "../define.js";

// EDHREC rank 25144.

export default defineCard({
  name: "Verduran Emissary",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  kicker: { cost: "{1}{R}" },
  text: "Kicker {1}{R} (You may pay an additional {1}{R} as you cast this spell.)\nWhen this creature enters, if it was kicked, destroy target artifact. It can't be regenerated.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["artifact"],
      effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
      resolve: null,
      text: "When this creature enters, if it was kicked, destroy target artifact. It can't be regenerated.",
      condition: { kind: "self-kicked" },
    },
  ],
});
