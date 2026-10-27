import { defineCard } from "../define.js";

const TEXT = "Discard two cards: Create a 2/2 black Zombie creature token.";

export default defineCard({
  name: "Zombie Infestation",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 2 } },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
