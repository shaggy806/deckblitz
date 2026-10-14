import { defineCard } from "../define.js";

// EDHREC rank 403.
//
// Rulings:
//   [2023-04-14] If another permanent you control would enter the battlefield with a number of
//     +1/+1 counters on it, it enters with that many plus one instead.
//   [2023-04-14] If two or more effects attempt to modify how many counters would be put onto a
//     permanent you control, you choose the order to apply those effects, no matter who controls
//     the sources of those effects.
//   [2023-04-14] The last ability is a mana ability. It doesn't use the stack and can't be
//     responded to.
//   [2023-04-14] If you control two Kamis of Whispered Hopes, the number of +1/+1 counters put on
//     a permanent is two plus the original number. Three Kamis of Whispered Hopes add three, and
//     so on.
//   [2023-04-14] However, if Kami of Whispered Hopes somehow enters the battlefield with +1/+1
//     counters it, its first ability won't apply to itself.

export default defineCard({
  name: "Kami of Whispered Hopes",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 1,
  text: "If one or more +1/+1 counters would be put on a permanent you control, that many plus one +1/+1 counters are put on that permanent instead.\n{T}: Add X mana of any one color, where X is this creature's power.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: { powerOf: "source" } },
      resolve: null,
      text: "{T}: Add X mana of any one color, where X is this creature's power.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-add-counter", plus: 1, counterKind: "+1/+1" },
      text: "If one or more +1/+1 counters would be put on a permanent you control, that many plus one +1/+1 counters are put on that permanent instead.",
    },
  ],
});
