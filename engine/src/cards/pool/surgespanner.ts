import { defineCard } from "../define.js";

const TEXT =
  "Whenever this creature becomes tapped, you may pay {1}{U}. If you do, return target permanent to its owner's hand.";

export default defineCard({
  name: "Surgespanner",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: ["permanent"],
      effect: {
        kind: "may",
        prompt: "Pay {1}{U} to return the target permanent to its owner's hand?",
        cost: "{1}{U}",
        effect: { kind: "return-to-hand", target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
