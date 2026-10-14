import { defineCard } from "../define.js";

// EDHREC rank 644.
//
// Rulings:
//   [2023-04-14] However, if Ozolith, the Shattered Spire somehow enters the battlefield with
//     +1/+1 counters it, its first ability won't apply to itself.
//   [2023-04-14] If another artifact or creature you control would enter the battlefield with a
//     number of +1/+1 counters on it, it enters with that many plus one instead.
//   [2023-04-14] If you somehow control two copies of Ozolith, the Shattered Spire, the number of
//     +1/+1 counters put on an artifact or creature you control is two plus the original number.
//     Three Ozoliths add three, and so on.
//   [2023-04-14] If two or more effects attempt to modify how many counters would be put onto a
//     permanent you control, you choose the order to apply those effects, no matter who controls
//     the sources of those effects.

export default defineCard({
  name: "Ozolith, the Shattered Spire",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["artifact"],
  cycling: { cost: "{2}" },
  text: "If one or more +1/+1 counters would be put on an artifact or creature you control, that many plus one +1/+1 counters are put on it instead.\n{1}{G}, {T}: Put a +1/+1 counter on target artifact or creature you control. Activate only as a sorcery.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  activated: [
    {
      cost: { mana: "{1}{G}", tap: true },
      targets: [{ kind: "permanent", whose: "you", filter: { typesAnyOf: ["artifact", "creature"] } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{1}{G}, {T}: Put a +1/+1 counter on target artifact or creature you control. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-add-counter", plus: 1, counterKind: "+1/+1", filter: { typesAnyOf: ["artifact", "creature"] } },
      text: "If one or more +1/+1 counters would be put on an artifact or creature you control, that many plus one +1/+1 counters are put on it instead.",
    },
  ],
});
