import { defineCard } from "../define.js";

// EDHREC rank 5258. Hell to Pay's shape, with Goblins.

export default defineCard({
  name: "Goblin Negotiation",
  manaCost: "{X}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Goblin Negotiation deals X damage to target creature. Create a number of 1/1 red Goblin creature tokens equal to the amount of excess damage dealt to that creature this way.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: "x", target: 0 },
      { kind: "create-token", token: "Goblin Token", count: { excessDamageThisWay: true, to: 0 } },
    ],
  },
});
