import { defineCard } from "../define.js";

// One enchantment card, or any two cards (enchantments included — the
// ruling): Thirst for Identity's `unlessOne`.
export default defineCard({
  name: "Thirst for Meaning",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Draw three cards. Then discard two cards unless you discard an enchantment card.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 3 },
      { kind: "discard", target: "you", amount: 2, unlessOne: { type: "enchantment" } },
    ],
  },
});
