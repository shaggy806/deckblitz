import { defineCard } from "../define.js";

// EDHREC rank 8735.
//
// Rulings:
//   [2012-05-01] Creatures with reach can still block creatures you control.
//   [2012-05-01] Bower Passage won’t affect a blocking creature that gains flying after blockers
//     are declared.
//
// `cantBeBlockedBy` is checked as blocks are declared, so a creature that
// gains flying afterwards stays blocking (the second ruling); reach is no
// exception to it (the first).

const TEXT = "Creatures with flying can't block creatures you control.";

export default defineCard({
  name: "Bower Passage",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you" } },
      cantBeBlockedBy: { keyword: "flying" },
      text: TEXT,
    },
  ],
});
