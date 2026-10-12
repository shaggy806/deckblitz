import { defineCard } from "../define.js";

export default defineCard({
  name: "Stingerfling Spider",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 2,
  toughness: 5,
  keywords: ["reach"],
  text: "Reach\nWhen this creature enters, you may destroy target creature with flying.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
      effect: {
        kind: "may",
        prompt: "Destroy target creature with flying?",
        effect: { kind: "destroy", target: 0 },
      },
      resolve: null,
      text: "When this creature enters, you may destroy target creature with flying.",
    },
  ],
});
