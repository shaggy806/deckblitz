import { defineCard } from "../define.js";

const DAMAGE_TEXT = "Whenever this creature is dealt damage, you may create that many 1/1 green Insect creature tokens.";

export default defineCard({
  name: "Saber Ants",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 2,
  toughness: 3,
  text: DAMAGE_TEXT,
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Create that many 1/1 green Insect creature tokens?",
        effect: { kind: "create-token", token: "Insect Token", count: { triggerValue: true } },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
