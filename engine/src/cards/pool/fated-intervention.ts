import { defineCard } from "../define.js";

// EDHREC rank 26969.

export default defineCard({
  name: "Fated Intervention",
  manaCost: "{2}{G}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Create two 3/3 green Centaur enchantment creature tokens. If it's your turn, scry 2.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "3/3 Green Enchantment Centaur Token", count: 2 },
      { kind: "conditional", condition: { kind: "your-turn" }, then: { kind: "scry", amount: 2 } },
    ],
  },
});
