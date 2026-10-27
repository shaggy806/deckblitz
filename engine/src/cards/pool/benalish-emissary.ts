import { defineCard } from "../define.js";

export default defineCard({
  name: "Benalish Emissary",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 4,
  kicker: { cost: "{1}{G}" },
  text: "Kicker {1}{G} (You may pay an additional {1}{G} as you cast this spell.)\nWhen this creature enters, if it was kicked, destroy target land.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["land"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "When this creature enters, if it was kicked, destroy target land.",
      condition: { kind: "self-kicked" },
    },
  ],
});
