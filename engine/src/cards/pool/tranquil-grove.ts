import { defineCard } from "../define.js";

export default defineCard({
  name: "Tranquil Grove",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "{1}{G}{G}: Destroy all other enchantments.",
  activated: [
    {
      cost: { mana: "{1}{G}{G}", tap: false },
      targets: [],
      effect: { kind: "destroy-all", filter: { type: "enchantment" }, exceptSource: true },
      resolve: null,
      text: "{1}{G}{G}: Destroy all other enchantments.",
    },
  ],
});
