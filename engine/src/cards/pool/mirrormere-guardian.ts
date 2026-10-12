import { defineCard } from "../define.js";

export default defineCard({
  name: "Mirrormere Guardian",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dwarf", "Soldier"],
  power: 4,
  toughness: 2,
  text: "When this creature dies, the Ring tempts you.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "the-ring-tempts-you" },
      resolve: null,
      text: "When this creature dies, the Ring tempts you.",
    },
  ],
});
