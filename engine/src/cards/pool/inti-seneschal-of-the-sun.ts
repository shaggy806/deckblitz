import { defineCard } from "../define.js";

// EDHREC rank 1949.
//
// Rulings:
//   [2023-11-10] You pay all costs and follow all normal timing rules for cards played due to the
//     last ability. For example, if the exiled card is a land card, you may play it only during
//     your main phase while the stack is empty.
//   [2023-11-10] You don't choose a target for Inti, Seneschal of the Sun's first ability at the
//     time it triggers. Rather, a second "reflexive" ability triggers when you discard a card this
//     way. You choose targets for that ability as it goes on the stack. Each player may respond to
//     this triggered ability as normal.
//
// "Whenever you attack" is Case of the Trampled Garden's `attack-with` of
// `atLeast: 1`; the discard and its "when you do" are Tether Technician's
// reflexive trigger (rule 603.12), its target chosen as it goes on the stack.
// "Whenever you discard one or more cards" is the `discards` trigger, once a
// batch (Rielle, the Everwise); the exile is Wiccan's impulse until your next
// end step.

const ATTACK_TEXT =
  "Whenever you attack, you may discard a card. When you do, put a +1/+1 counter on target attacking creature. It gains trample until end of turn.";
const DISCARD_TEXT =
  "Whenever you discard one or more cards, exile the top card of your library. You may play that card until your next end step.";

export default defineCard({
  name: "Inti, Seneschal of the Sun",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  text: `${ATTACK_TEXT}\n${DISCARD_TEXT}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: {
                kind: "reflexive-trigger",
                targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", attacking: true } }],
                effect: {
                  kind: "sequence",
                  effects: [
                    { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
                    { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
                  ],
                },
                text: "When you do, put a +1/+1 counter on target attacking creature. It gains trample until end of turn.",
              },
            },
          ],
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "discards", who: "you" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "your-next-end-step" },
      resolve: null,
      text: DISCARD_TEXT,
    },
  ],
});
