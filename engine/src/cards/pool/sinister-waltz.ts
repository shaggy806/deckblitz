import { defineCard } from "../define.js";

// EDHREC rank 12391.
//
// Ruling: with only one or two of the three still legal targets as it
// resolves, all of them go onto the battlefield and nothing goes to the
// library (`choose-random-card`'s `count` picks every candidate when there
// are no more than that, and `others` gets none). The two returned enter
// together; then the other goes to the bottom.

const TEXT =
  "Choose three target creature cards in your graveyard. Return two of them at random to the battlefield and put the other on the bottom of your library.";

const creatureCard = { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } as const;

export default defineCard({
  name: "Sinister Waltz",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: TEXT,
  targets: [
    creatureCard,
    { kind: "other", of: creatureCard, than: { slots: [0] } },
    { kind: "other", of: creatureCard, than: { slots: [0, 1] } },
  ],
  effect: {
    kind: "choose-random-card",
    zone: "targets",
    count: 2,
    then: { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "put-onto-battlefield", target: 0 } },
    others: { kind: "put-on-library", target: 0, position: "bottom" },
  },
});
