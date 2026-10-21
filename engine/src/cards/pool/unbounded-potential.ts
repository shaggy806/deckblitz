import { defineCard } from "../define.js";

// EDHREC rank 8271.
//
// Rulings:
//   [2021-06-18] You don't have to choose every permanent or player that has a counter, only the
//     ones you want to add another counter to. Since “any number” includes zero, you don't have to
//     choose any permanents at all, and you don't have to choose any players at all.
//   [2021-06-18] While proliferating, if you choose a permanent or player with multiple kinds of
//     counters, the permanent or player gets another counter of each kind, not just one kind. This
//     change from the original proliferate rules was introduced in a previous set.
//   [2021-06-18] Players can respond to a spell or ability whose effect includes proliferating.
//     Once that spell or ability starts to resolve, however, and its controller chooses which
//     permanents and players will get new counters, it's too late for anyone to respond.
//   [2021-06-18] If you cast this spell by paying its entwine cost, you will be able to
//     proliferate the counters that you placed with the first mode.
//   [2021-06-18] If a permanent has +1/+1 counters and -1/-1 counters on it, they're removed in
//     pairs as a state-based action so that the permanent has only one of those kinds of counters
//     (or none of either kind of counters) on it.
//   [2021-06-18] To proliferate, you can choose any permanent that has a counter, including ones
//     controlled by opponents, and you can choose any player who has a counter, including
//     opponents. You can't choose cards in any zone other than the battlefield, even if they have
//     counters on them.

export default defineCard({
  name: "Unbounded Potential",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  kicker: { cost: "{3}{W}", keyword: "entwine" },
  text: "Choose one —\n• Put a +1/+1 counter on each of up to two target creatures.\n• Proliferate. (Choose any number of permanents and/or players, then give each another counter of each kind already there.)\nEntwine {3}{W} (Choose both if you pay the entwine cost.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    kickedModes: 2,
    modes: [
      {
        text: "Put a +1/+1 counter on each of up to two target creatures.",
        targets: [
          { kind: "optional", of: "creature" },
          { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
        ],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
            { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
          ],
        },
      },
      { text: "Proliferate.", effect: { kind: "proliferate" } },
    ],
  },
});
