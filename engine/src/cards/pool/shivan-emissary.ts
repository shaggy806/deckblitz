import { defineCard } from "../define.js";

export default defineCard({
  name: "Shivan Emissary",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  kicker: { cost: "{1}{B}" },
  text: "Kicker {1}{B} (You may pay an additional {1}{B} as you cast this spell.)\nWhen this creature enters, if it was kicked, destroy target nonblack creature. It can't be regenerated.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["nonblack-creature"],
      effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
      resolve: null,
      text: "When this creature enters, if it was kicked, destroy target nonblack creature. It can't be regenerated.",
      condition: { kind: "self-kicked" },
    },
  ],
});
