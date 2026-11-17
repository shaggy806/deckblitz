import { defineCard } from "../define.js";

// EDHREC rank 12255.
//
// Rulings:
//   [2024-04-12] If the target creature is an illegal target as Oko's first ability tries to
//     resolve, it won't resolve and none of its effects will happen. Oko won't gain hexproof.
//   [2024-04-12] While Oko is a copy of a creature, he isn't a planeswalker. He won't have his
//     loyalty abilities, and damage dealt to him won't cause him to lose loyalty counters.
//   [2024-04-12] When Oko becomes a copy of the target creature, he's neither entering nor
//     leaving the battlefield. Any enters-the-battlefield or leaves-the-battlefield abilities
//     won't trigger.
//   [2024-04-12] Each of the tokens created by Oko's last ability copies exactly what was
//     printed on the original permanent and nothing else (unless that permanent is copying
//     something else or is a token).
//
// The combat trigger is Muddle, the Ever-Changing's `become-copy` until end of turn, with
// hexproof as a copy exception. The −5's "each other nonland permanent you control" is a
// `create-token-copy` of `{ each }` whose filter leaves Oko out with `isSource: false` (read
// against the source), so a second Oko — a copy, or a token one — is still copied.

const COMBAT_TEXT =
  "At the beginning of combat on your turn, Oko becomes a copy of up to one target creature you control until end of turn, except he has hexproof.";
const PLUS_ONE =
  "[+1]: Draw two cards. If you've committed a crime this turn, discard a card. Otherwise, discard two cards.";
const MINUS_ONE = "[-1]: Create a 3/3 green Elk creature token.";
const MINUS_FIVE = "[-5]: For each other nonland permanent you control, create a token that's a copy of that permanent.";

export default defineCard({
  name: "Oko, the Ringleader",
  manaCost: "{2}{G}{U}",
  colors: ["G", "U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Oko"],
  loyalty: 3,
  text: `${COMBAT_TEXT}\n${PLUS_ONE}\n${MINUS_ONE}\n${MINUS_FIVE}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "optional", of: "creature-you-control" }],
      effect: {
        kind: "become-copy",
        target: "source",
        of: 0,
        until: "end-of-turn",
        exceptions: { keywords: ["hexproof"] },
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          {
            kind: "conditional",
            condition: { kind: "committed-crime-this-turn" },
            then: { kind: "discard", target: "you", amount: 1 },
            else: { kind: "discard", target: "you", amount: 2 },
          },
        ],
      },
      resolve: null,
      text: PLUS_ONE,
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Elk Token", count: 1 },
      resolve: null,
      text: MINUS_ONE,
    },
    {
      loyaltyCost: -5,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-token-copy",
        of: { each: { notTypes: ["land"], controlledBy: "you", isSource: false } },
        count: 1,
        who: "you",
      },
      resolve: null,
      text: MINUS_FIVE,
    },
  ],
});
