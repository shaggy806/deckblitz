import { defineCard } from "../define.js";

// EDHREC rank 9252.

const TEXT =
  "Whenever a creature an opponent controls dies, you may pay {1}. If you do, create a 1/1 white Spirit creature token with flying.";

export default defineCard({
  name: "Haunted Library",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", controlledBy: "opponent" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to create a 1/1 Spirit with flying?",
        cost: "{1}",
        effect: { kind: "create-token", token: "Spirit Token", count: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
