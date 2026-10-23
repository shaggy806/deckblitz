import { defineCard } from "../define.js";

export default defineCard({
  name: "Sinister Concoction",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "{B}, Pay 1 life, Mill a card, Discard a card, Sacrifice this enchantment: Destroy target creature.",
  activated: [
    {
      cost: { mana: "{B}", tap: false, payLife: 1, mill: 1, discard: { count: 1 }, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{B}, Pay 1 life, Mill a card, Discard a card, Sacrifice this enchantment: Destroy target creature.",
    },
  ],
});
