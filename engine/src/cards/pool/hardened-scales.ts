import { defineCard } from "../define.js";

// EDHREC rank 185.
//
// Rulings:
//   [2023-09-01] Each additional Hardened Scales you control will increase the number of +1/+1
//     counters placed on a creature you control by one.
//   [2023-09-01] If a creature you control would enter the battlefield with a number of +1/+1
//     counters on it, it enters with that many plus one instead.
//   [2023-09-01] If two or more effects attempt to modify how many counters would be put on a
//     creature you control, you choose the order to apply those effects, no matter who controls
//     the sources of those effects.

export default defineCard({
  name: "Hardened Scales",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "If one or more +1/+1 counters would be put on a creature you control, that many plus one +1/+1 counters are put on it instead.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-add-counter", plus: 1, counterKind: "+1/+1", filter: { type: "creature" } },
      text: "If one or more +1/+1 counters would be put on a creature you control, that many plus one +1/+1 counters are put on it instead.",
    },
  ],
});
