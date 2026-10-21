import { defineCard } from "../define.js";

// EDHREC rank 18490.

const TEXT = "{G}{G}: Counter target black spell.";

export default defineCard({
  name: "Lifeforce",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{G}{G}", tap: false },
      targets: [{ kind: "spell", filter: { colors: ["B"] } }],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
