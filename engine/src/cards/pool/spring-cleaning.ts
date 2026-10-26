import { defineCard } from "../define.js";

// EDHREC rank 19549.
//
// Clash (rule 701.30): the `clash` effect after the destroy.
//
// Rulings:
//   [2007-10-01] If you win the clash, you destroy all enchantments all of your opponents control,
//     not just enchantments controlled by the opponent you clashed with.
//   [2013-09-20] If you win the clash and the targeted enchantment is controlled by an opponent,
//     it will be destroyed a second time if it's still on the battlefield (for instance, if it
//     somehow regenerated).

export default defineCard({
  name: "Spring Cleaning",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Destroy target enchantment. Clash with an opponent. If you win, destroy all enchantments your opponents control. (Each clashing player reveals the top card of their library, then puts that card on their choice of the top or bottom. A player wins if their card had a greater mana value.)",
  targets: ["enchantment"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "clash", won: { kind: "destroy-all", filter: { type: "enchantment", controlledBy: "opponent" } } },
    ],
  },
});
