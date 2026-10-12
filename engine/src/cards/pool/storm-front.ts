import { defineCard } from "../define.js";

export default defineCard({
  name: "Storm Front",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "{G}{G}: Tap target creature with flying.",
  activated: [
    {
      cost: { mana: "{G}{G}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{G}{G}: Tap target creature with flying.",
    },
  ],
});
