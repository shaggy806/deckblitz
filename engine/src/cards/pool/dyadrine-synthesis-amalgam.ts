import { defineCard } from "../define.js";

// EDHREC rank 8907.
//
// Rulings:
//   [2025-07-25] If an effect allows you to cast Dyadrine without paying its mana cost, X will be
//     0.
//   [2025-07-25] If an effect requires you to pay some amount of mana to prevent Dyadrine from
//     being countered, as Divert Disaster does, that mana wasn't spent to cast Dyadrine and will
//     not be taken into account for Dyadrine's second ability.
//   [2025-07-25] If a copy of Dyadrine is created on the stack, no mana was spent to cast the
//     copy. The amount of mana spent to cast the original spell is not copied.
//   [2025-07-25] Dyadrine's second ability cares about the amount of mana that was actually paid
//     to cast Dyadrine. Any effects that increase or decrease the cost to cast it (including the
//     "commander tax" in a Commander game) will also be taken into account.
//
// The counters read the mana the permanent kept from its cast (`manaSpentOf`,
// 0 when it wasn't cast). "Remove a +1/+1 counter from each of two creatures"
// can only be done with two creatures that have one, so it's offered only
// then, and the two are chosen as it resolves (not targets); "if you do" is
// the `may`'s `then`.

const ENTERS_TEXT =
  "Dyadrine enters with a number of +1/+1 counters on it equal to the amount of mana spent to cast it.";
const ATTACK_TEXT =
  "Whenever you attack, you may remove a +1/+1 counter from each of two creatures you control. If you do, draw a card and create a 2/2 colorless Robot artifact creature token.";
const WITH_COUNTER = { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } } as const;

export default defineCard({
  name: "Dyadrine, Synthesis Amalgam",
  manaCost: "{X}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 0,
  toughness: 1,
  keywords: ["trample"],
  text: `Trample\n${ENTERS_TEXT}\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: { manaSpentOf: "source" } } },
      text: ENTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "controls", filter: WITH_COUNTER, atLeast: 2 },
        then: {
          kind: "may",
          prompt: "Remove a +1/+1 counter from each of two creatures you control to draw a card and create a Robot?",
          effect: {
            kind: "choose-permanents",
            filter: WITH_COUNTER,
            min: 2,
            upTo: 2,
            then: { kind: "remove-counter", target: 0, counter: "+1/+1", amount: 1 },
            prompt: "Choose two creatures you control to remove a +1/+1 counter from",
          },
          then: {
            kind: "sequence",
            effects: [
              { kind: "draw", amount: 1 },
              { kind: "create-token", token: "Robot Token", count: 1 },
            ],
          },
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
