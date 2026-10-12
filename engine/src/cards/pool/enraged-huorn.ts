import { defineCard } from "../define.js";

export default defineCard({
  name: "Enraged Huorn",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 4,
  toughness: 5,
  keywords: ["trample"],
  text: "Trample\nWhen this creature enters, the Ring tempts you.",
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
