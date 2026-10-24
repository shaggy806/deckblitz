import { defineCard } from "../define.js";

// EDHREC rank 19010.
//
// Rulings:
//   [2016-08-23] The effects of each council’s dilemma ability happen in the stated order. First
//     the vote occurs, then the first effect, and finally the second effect.
//   [2016-08-23] If a creature with an enters-the-battlefield council’s dilemma ability leaves the
//     battlefield before that ability resolves, players can still vote for any option that would
//     put +1/+1 counters on that creature, even though—or perhaps especially because—those votes
//     won’t generate an effect.
//   [2016-08-23] You must vote for one of the available options. You can’t abstain.
//
// The vote, then two counters per sprout vote, then 3 life per harvest vote.
const TEXT =
  "Council's dilemma — When this creature enters, starting with you, each player votes for sprout or harvest. Put two +1/+1 counters on this creature for each sprout vote. You gain 3 life for each harvest vote.";

export default defineCard({
  name: "Orchard Elemental",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "vote", for: { options: ["sprout", "harvest"] } },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: { product: [2, { votesFor: 0 }] } },
          { kind: "gain-life", amount: { product: [3, { votesFor: 1 }] } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
