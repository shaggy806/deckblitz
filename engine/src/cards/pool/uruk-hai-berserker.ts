import { defineCard } from "../define.js";

export default defineCard({
  name: "Uruk-hai Berserker",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Orc", "Berserker"],
  power: 3,
  toughness: 2,
  text: "When this creature enters, the Ring tempts you.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "the-ring-tempts-you" },
      resolve: null,
      text: "When this creature enters, the Ring tempts you.",
    },
  ],
});
