import { defineCard } from "../define.js";

const TEXT = "{U}{U}: Tap target creature without flying.";

export default defineCard({
  name: "Flood",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{U}{U}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", notKeyword: "flying" } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
