import { defineCard } from "../define.js";

// EDHREC rank 16208.
//
// Rulings:
//   [2025-11-17] All of the -1/-1 counters must be put on a single creature. You can't choose to
//     split them up between multiple creatures.
//   [2025-11-17] If a creature on the battlefield has {X} in its mana cost, X is 0 for the purpose
//     of determining its mana value.
//   [2025-11-17] The creature you choose to put -1/-1 counters on doesn't have to have enough
//     toughness to survive the process. For example, if you blight 2, you can choose to put the
//     counters on a 1/1 creature you control.
//   [2025-11-17] If you can't place -1/-1 counters on any creatures you control (probably because
//     you control no creatures), you can't choose to blight.
//   [2025-11-17] If the target creature is an illegal target as Requiting Hex tries to resolve, it
//     won't resolve and none of its effects will happen. You won't gain life even if the
//     additional cost was paid.
//   [2025-11-17] Once you've announced that you're casting a spell or activating an ability,
//     players can't take actions until you've finished doing so. Notably, opponents can't try to
//     destroy or otherwise remove your creatures to stop you from blighting as part of paying the
//     cost of that spell or ability.
//   [2025-11-17] If a creature that has +1/+1 counters on it receives enough -1/-1 counters to
//     cause it to be destroyed by lethal damage or put into its owner's graveyard for having 0 or
//     less toughness, effects that refer to the counters on that creature when it died will see
//     all of those +1/+1 and -1/-1 counters.
//   [2025-11-17] If a creature has +1/+1 counters and -1/-1 counters on it, state-based actions
//     remove the same number of each so that it has only one kind of those counters on it. For
//     example, if a creature has three +1/+1 counters on it and two -1/-1 counters are put on it,
//     state-based actions will remove two of each of those kinds of counters, leaving the creature
//     with just one +1/+1 counter.

// Burning Curiosity's optional blight: the kicked variant blights, and its
// effect is the destroy plus the life. An illegal target on resolution means
// no life either (the ruling — the spell doesn't resolve).
export default defineCard({
  name: "Requiting Hex",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, you may blight 1. (You may put a -1/-1 counter on a creature you control.)\nDestroy target creature with mana value 2 or less. If this spell's additional cost was paid, you gain 2 life.",
  targets: [{ kind: "permanent", filter: { type: "creature", manaValue: { op: "lte", n: 2 } } }],
  effect: { kind: "destroy", target: 0 },
  kicker: {
    cost: "",
    keyword: "blight",
    blight: 1,
    effect: {
      kind: "sequence",
      effects: [
        { kind: "destroy", target: 0 },
        { kind: "gain-life", amount: 2 },
      ],
    },
  },
});
