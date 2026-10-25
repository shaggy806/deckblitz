import { defineCard } from "../define.js";

// EDHREC rank 22290.

const TEXT =
  "Inspired — Whenever this creature becomes untapped, you may pay {2}{W}. If you do, create two 1/1 white Soldier enchantment creature tokens.";

export default defineCard({
  name: "God-Favored General",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-untapped", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2}{W} to create two 1/1 Soldier tokens?",
        cost: "{2}{W}",
        effect: { kind: "create-token", token: "1/1 White Enchantment Soldier Token", count: 2 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
