import { defineCard } from "../define.js";

// EDHREC rank 14866.
//
// Rulings:
//   [2016-08-23] No player votes until the spell or ability resolves. Any responses to that spell
//     or ability must be made without knowing the outcome of the vote.
//   [2016-08-23] If a creature with an enters-the-battlefield council’s dilemma ability leaves the
//     battlefield before that ability resolves, players can still vote for any option that would
//     put +1/+1 counters on that creature, even though—or perhaps especially because—those votes
//     won’t generate an effect.
//   [2016-08-23] You must vote for one of the available options. You can’t abstain.
//   [2016-08-23] The effects of each council’s dilemma ability happen in the stated order. First
//     the vote occurs, then the first effect, and finally the second effect.
//
// Council's dilemma (Fateful Tempest's shape): the vote, then the counters
// for each feather vote, then a draw for each quill vote, then a discard for
// each card drawn this way.
const TEXT =
  "Council's dilemma — When this creature enters, starting with you, each player votes for feather or quill. Put a +1/+1 counter on this creature for each feather vote and draw a card for each quill vote. For each card drawn this way, discard a card.";

export default defineCard({
  name: "Messenger Jays",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "vote", for: { options: ["feather", "quill"] } },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: { votesFor: 0 } },
          { kind: "draw", amount: { votesFor: 1 } },
          { kind: "discard", target: "you", amount: { thisWay: "drawn" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
