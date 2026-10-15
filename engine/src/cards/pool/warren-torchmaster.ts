import { defineCard } from "../define.js";

// EDHREC rank 14004.
//
// Rulings:
//   [2025-11-17] You don't choose a target for Warren Torchmaster's ability at the time it
//     triggers. Rather, a second "reflexive" ability triggers when you blight 1 this way. You
//     choose a target for that ability as it goes on the stack. Each player may respond to this
//     triggered ability as normal.
//   [2025-11-17] Once you've announced that you're casting a spell or activating an ability,
//     players can't take actions until you've finished doing so. Notably, opponents can't try to
//     destroy or otherwise remove your creatures to stop you from blighting as part of paying the
//     cost of that spell or ability.
//   [2025-11-17] If a creature that has +1/+1 counters on it receives enough -1/-1 counters to
//     cause it to be destroyed by lethal damage or put into its owner's graveyard for having 0 or
//     less toughness, effects that refer to the counters on that creature when it died will see
//     all of those +1/+1 and -1/-1 counters.
//   [2025-11-17] The creature you choose to put -1/-1 counters on doesn't have to have enough
//     toughness to survive the process. For example, if you blight 2, you can choose to put the
//     counters on a 1/1 creature you control.
//   [2025-11-17] If you can't place -1/-1 counters on any creatures you control (probably because
//     you control no creatures), you can't choose to blight.
//   [2025-11-17] If a creature has +1/+1 counters and -1/-1 counters on it, state-based actions
//     remove the same number of each so that it has only one kind of those counters on it. For
//     example, if a creature has three +1/+1 counters on it and two -1/-1 counters are put on it,
//     state-based actions will remove two of each of those kinds of counters, leaving the creature
//     with just one +1/+1 counter.
//   [2025-11-17] All of the -1/-1 counters must be put on a single creature. You can't choose to
//     split them up between multiple creatures.

// "You may blight 1. When you do, ...": a `may` of the blight (not offered
// without a creature to blight — rule 701.68b) whose `then` is a reflexive
// trigger, so its target is chosen as that goes on the stack (the ruling).
const COMBAT_TEXT =
  "At the beginning of combat on your turn, you may blight 1. When you do, target creature gains haste until end of turn.";

export default defineCard({
  name: "Warren Torchmaster",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 2,
  toughness: 2,
  text: `${COMBAT_TEXT} (To blight 1, put a -1/-1 counter on a creature you control.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Blight 1?",
        effect: { kind: "blight", amount: 1 },
        then: {
          kind: "reflexive-trigger",
          targets: ["creature"],
          effect: { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
          text: "When you do, target creature gains haste until end of turn.",
        },
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
