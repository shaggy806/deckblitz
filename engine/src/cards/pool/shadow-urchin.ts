import { defineCard } from "../define.js";

// EDHREC rank 14506.
//
// Rulings:
//   [2025-11-17] The creature you choose to put -1/-1 counters on doesn't have to have enough
//     toughness to survive the process. For example, if you blight 2, you can choose to put the
//     counters on a 1/1 creature you control.
//   [2025-11-17] You pay all costs and follow all timing rules for cards played this way. For
//     example, if an exiled card is a land card, you may play it only during your main phase while
//     the stack is empty.
//   [2025-11-17] All of the -1/-1 counters must be put on a single creature. You can't choose to
//     split them up between multiple creatures.
//   [2025-11-17] If you can't place -1/-1 counters on any creatures you control (probably because
//     you control no creatures), you can't choose to blight.
//   [2025-11-17] If a creature has +1/+1 counters and -1/-1 counters on it, state-based actions
//     remove the same number of each so that it has only one kind of those counters on it. For
//     example, if a creature has three +1/+1 counters on it and two -1/-1 counters are put on it,
//     state-based actions will remove two of each of those kinds of counters, leaving the creature
//     with just one +1/+1 counter.
//   [2025-11-17] If a creature that has +1/+1 counters on it receives enough -1/-1 counters to
//     cause it to be destroyed by lethal damage or put into its owner's graveyard for having 0 or
//     less toughness, effects that refer to the counters on that creature when it died will see
//     all of those +1/+1 and -1/-1 counters.
//   [2025-11-17] Once you've announced that you're casting a spell or activating an ability,
//     players can't take actions until you've finished doing so. Notably, opponents can't try to
//     destroy or otherwise remove your creatures to stop you from blighting as part of paying the
//     cost of that spell or ability.

// The death trigger is Felisa, Fang of Silverquill's: "with one or more
// counters on it" is every counter of every kind, read as the creature last
// existed (+1/+1 and -1/-1 counters both — the ruling), and "that many" is
// `countersOn` of the trigger object.
const ATTACK_TEXT = "Whenever this creature attacks, blight 1.";
const DIES_TEXT =
  "Whenever a creature you control with one or more counters on it dies, exile that many cards from the top of your library. Until your next end step, you may play those cards.";

export default defineCard({
  name: "Shadow Urchin",
  manaCost: "{2}{B/R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Ouphe"],
  power: 3,
  toughness: 4,
  text: `${ATTACK_TEXT} (Put a -1/-1 counter on a creature you control.)\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "blight", amount: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", counters: { compare: { op: "gte", n: 1 } } },
      },
      targets: [],
      effect: {
        kind: "impulse-exile",
        amount: { countersOn: "trigger-object" },
        duration: "your-next-end-step",
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
