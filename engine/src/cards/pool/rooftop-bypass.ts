import { defineCard } from "../define.js";

export default defineCard({
  name: "Rooftop Bypass",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["enchantment"],
  text: "Whenever one or more nontoken creatures you control deal combat damage to a player, create a 1/1 black Assassin creature token with menace. (It can't be blocked except by two or more creatures.)",
  triggered: [
    {
      trigger: {
        on: "deals-damage-batch",
        who: "you-control",
        filter: { token: false, type: "creature" },
        combat: true,
      },
      targets: [],
      effect: { kind: "create-token", token: "Assassin Token (Aya of Alexandria)", count: 1 },
      resolve: null,
      text: "Whenever one or more nontoken creatures you control deal combat damage to a player, create a 1/1 black Assassin creature token with menace.",
    },
  ],
});
