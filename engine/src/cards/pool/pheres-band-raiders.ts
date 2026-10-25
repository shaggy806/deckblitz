import { defineCard } from "../define.js";

// EDHREC rank 28635.

const TEXT =
  "Inspired — Whenever this creature becomes untapped, you may pay {2}{G}. If you do, create a 3/3 green Centaur enchantment creature token.";

export default defineCard({
  name: "Pheres-Band Raiders",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Centaur", "Warrior"],
  power: 5,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-untapped", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2}{G} to create a 3/3 Centaur token?",
        cost: "{2}{G}",
        effect: { kind: "create-token", token: "3/3 Green Enchantment Centaur Token", count: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
