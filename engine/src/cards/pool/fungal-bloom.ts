import { defineCard } from "../define.js";

// EDHREC rank 19835. Fallen Empires.

const TEXT = "{G}{G}: Put a spore counter on target Fungus.";

export default defineCard({
  name: "Fungal Bloom",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{G}{G}", tap: false },
      targets: [{ kind: "permanent", filter: { subtype: "Fungus" } }],
      effect: { kind: "add-counter", target: 0, counter: "spore", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
