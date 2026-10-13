import { defineCard } from "../define.js";

// EDHREC rank 302.
//
// Rulings:
//   [2020-04-17] You can't move only some of the counters from The Ozolith onto the target
//     creature.
//   [2020-04-17] +1/+1 counters on The Ozolith have no effect unless it becomes a creature.
//     Keyword counters on The Ozolith will grant it keywords that may have no practical effect.
//     For example, flying on a noncreature artifact is just strange, but hexproof on a noncreature
//     artifact is entirely useful.
//   [2020-04-17] If The Ozolith leaves the battlefield after the last ability triggers but before
//     it resolves, you can't move any counters from it onto the target creature.
//   [2020-04-17] The Ozolith's first ability doesn't move counters off the creature that's left
//     the battlefield. Rather, you put the same number of each kind of counter the creature had
//     onto The Ozoloith. Notably, if you somehow control a second The Ozolith, each one will
//     receive the same number and kinds of counters that were on the creature that left the
//     battlefield. Similarly, if the creature has an ability that triggers when it leaves the
//     battlefield that refers to the number of counters it had, that ability will use the number
//     of counters that were on the permanent, even if The Ozolith's first ability resolves first.
//   [2020-04-17] As The Ozolith's last ability resolves, you choose whether to move the counters.
//   [2020-04-17] If the target creature is an illegal target by the time The Ozolith's last
//     ability tries to resolve, the ability won't resolve. You won't remove any counters from The
//     Ozolith.

export default defineCard({
  name: "The Ozolith",
  manaCost: "{1}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: "Whenever a creature you control leaves the battlefield, if it had counters on it, put those counters on The Ozolith.\nAt the beginning of combat on your turn, if The Ozolith has counters on it, you may move all counters from The Ozolith onto target creature.",
  triggered: [
    {
      // "If it had counters on it" is read off the creature as it left
      // (last-known information); "those counters" are each kind it had, put
      // on rather than moved (rule 122.8).
      trigger: {
        on: "leaves-battlefield",
        who: "you-control",
        filter: { type: "creature", counters: { compare: { op: "gte", n: 1 } } },
      },
      targets: [],
      effect: { kind: "put-counters-of", of: "trigger-object", target: "source" },
      resolve: null,
      text: "Whenever a creature you control leaves the battlefield, if it had counters on it, put those counters on The Ozolith.",
    },
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "self-counters", compare: { op: "gte", n: 1 } },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Move all counters from The Ozolith onto the target creature?",
        effect: { kind: "move-counters", from: "source", to: 0, amount: "all" },
      },
      resolve: null,
      text: "At the beginning of combat on your turn, if The Ozolith has counters on it, you may move all counters from The Ozolith onto target creature.",
    },
  ],
});
