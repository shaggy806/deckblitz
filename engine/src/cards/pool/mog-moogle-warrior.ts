import { defineCard } from "../define.js";

// EDHREC rank 7313. Final Fantasy.
//
// Rulings:
//   [2025-06-06] As long as at least one creature card was discarded this way, you'll create a
//     Moogle token, and as long as at least one noncreature card was discarded this way, you'll
//     put a +1/+1 counter on each Moogle you control. Additional creature cards discarded beyond
//     the first won't result in additional Moogle tokens, and additional noncreature cards
//     discarded beyond the first won't result in additional counters.
//
// The Death of Gwen Stacy's `each-player-may` discard, with Gix's "each
// player who did draws a card" as its `ifDid`. What was discarded this way is
// every player's discard in this resolution, so the two tails are `this-way`
// conditions over all of them: one Moogle however many creature cards, one
// round of counters however many noncreature cards (the ruling).
const DANCE_TEXT =
  "Dance — At the beginning of your end step, each player may discard a card. Each player who discarded a card this way draws a card. If a creature card was discarded this way, you create a 1/2 white Moogle creature token with lifelink. Then if a noncreature card was discarded this way, put a +1/+1 counter on each Moogle you control.";

export default defineCard({
  name: "Mog, Moogle Warrior",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Moogle", "Warrior"],
  power: 1,
  toughness: 2,
  keywords: ["lifelink"],
  text: `Lifelink\n${DANCE_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "each-player-may",
            who: "each-player",
            options: [{ discard: 1, text: "Discard a card" }],
            ifDid: { kind: "draw", amount: 1, who: "that-player" },
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "discarded", filter: { type: "creature" } },
            then: { kind: "create-token", token: "Moogle Token", count: 1 },
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "discarded", filter: { notTypes: ["creature"] } },
            then: {
              kind: "add-counter-all",
              filter: { subtype: "Moogle", controlledBy: "you" },
              counter: "+1/+1",
              amount: 1,
            },
          },
        ],
      },
      resolve: null,
      text: DANCE_TEXT,
    },
  ],
});
