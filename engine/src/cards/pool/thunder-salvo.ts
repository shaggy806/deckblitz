import { defineCard } from "../define.js";

// EDHREC rank 18298.
//
// Rulings:
//   [2024-04-12] The value of X is determined only once, as Thunder Salvo resolves.
//   [2024-04-12] Thunder Salvo will count any other spells you’ve cast this turn. It doesn’t
//     matter if the other spells resolved, didn’t resolve, were countered, or are still on the
//     stack.

// "The number of **other** spells you've cast this turn": the turn's count
// includes this spell when you cast it, so it's one less — but a copy was
// never cast, and every spell you cast is "other" to it. X is read once, as
// it resolves (the ruling); countered or unresolved spells count too.
const CAST_THIS_TURN = { turnStat: "spells-cast", who: "you" } as const;

export default defineCard({
  name: "Thunder Salvo",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Thunder Salvo deals X damage to target creature, where X is 2 plus the number of other spells you've cast this turn.",
  targets: ["creature"],
  effect: {
    kind: "damage",
    target: 0,
    amount: {
      ifCondition: { kind: "source", filter: { cast: true, castBy: "you" } },
      then: { sum: [1, CAST_THIS_TURN] },
      else: { sum: [2, CAST_THIS_TURN] },
    },
  },
});
