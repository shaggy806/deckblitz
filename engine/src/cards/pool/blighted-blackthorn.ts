import { defineCard } from "../define.js";

// EDHREC rank 16281.
//
// Rulings:
//   [2025-11-17] All of the -1/-1 counters must be put on a single creature. You can't choose to
//     split them up between multiple creatures.
//   [2025-11-17] If a creature that has +1/+1 counters on it receives enough -1/-1 counters to
//     cause it to be destroyed by lethal damage or put into its owner's graveyard for having 0 or
//     less toughness, effects that refer to the counters on that creature when it died will see
//     all of those +1/+1 and -1/-1 counters.
//   [2025-11-17] If a creature has +1/+1 counters and -1/-1 counters on it, state-based actions
//     remove the same number of each so that it has only one kind of those counters on it. For
//     example, if a creature has three +1/+1 counters on it and two -1/-1 counters are put on it,
//     state-based actions will remove two of each of those kinds of counters, leaving the creature
//     with just one +1/+1 counter.
//   [2025-11-17] If you can't place -1/-1 counters on any creatures you control (probably because
//     you control no creatures), you can't choose to blight.
//   [2025-11-17] Once you've announced that you're casting a spell or activating an ability,
//     players can't take actions until you've finished doing so. Notably, opponents can't try to
//     destroy or otherwise remove your creatures to stop you from blighting as part of paying the
//     cost of that spell or ability.
//   [2025-11-17] The creature you choose to put -1/-1 counters on doesn't have to have enough
//     toughness to survive the process. For example, if you blight 2, you can choose to put the
//     counters on a 1/1 creature you control.

// "Enters or attacks": two triggers, each a `may` blight whose `then` is the
// "if you do" (not offered without a creature to blight — rule 701.68b).
const TEXT = "Whenever this creature enters or attacks, you may blight 2. If you do, you draw a card and lose 1 life.";

export default defineCard({
  name: "Blighted Blackthorn",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Treefolk", "Warlock"],
  power: 3,
  toughness: 7,
  text: `${TEXT} (To blight 2, put two -1/-1 counters on a creature you control.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Blight 2 to draw a card and lose 1 life?",
        effect: { kind: "blight", amount: 2 },
        then: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1 },
            { kind: "lose-life", amount: 1 },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Blight 2 to draw a card and lose 1 life?",
        effect: { kind: "blight", amount: 2 },
        then: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1 },
            { kind: "lose-life", amount: 1 },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
