import { defineCard } from "../define.js";

export default defineCard({
  name: "Relentless Rohirrim",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 4,
  toughness: 3,
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
