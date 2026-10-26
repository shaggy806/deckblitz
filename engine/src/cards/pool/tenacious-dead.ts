import { defineCard } from "../define.js";

const TEXT =
  "When this creature dies, you may pay {1}{B}. If you do, return it to the battlefield tapped under its owner's control.";

export default defineCard({
  name: "Tenacious Dead",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton", "Warrior"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1}{B} to return Tenacious Dead to the battlefield tapped?",
        cost: "{1}{B}",
        effect: { kind: "put-onto-battlefield", target: "trigger-object", enterTapped: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
