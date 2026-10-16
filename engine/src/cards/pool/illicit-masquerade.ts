import { defineCard } from "../define.js";

// EDHREC rank 13568.
//
// The dies trigger reads any creature you control with an impostor counter as
// it last existed (the ruling: not only the ones this put counters on). "It"
// is the card it became in your graveyard, and the target — chosen as the
// trigger goes on the stack, when that card is already there — is "up to one
// **other**" creature card, so never that one.
const ENTERS = "When this enchantment enters, put an impostor counter on each creature you control.";
const DIES =
  "Whenever a creature you control with an impostor counter on it dies, exile it. Return up to one other target creature card from your graveyard to the battlefield.";

export default defineCard({
  name: "Illicit Masquerade",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  keywords: ["flash"],
  text: `Flash\n${ENTERS}\n${DIES}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "impostor",
        amount: 1,
      },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", counters: { kind: "impostor", compare: { op: "gte", n: 1 } } },
      },
      targets: [
        {
          kind: "optional",
          of: {
            kind: "other",
            of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
            than: "trigger-object",
          },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "trigger-object" },
          { kind: "put-onto-battlefield", target: 0 },
        ],
      },
      resolve: null,
      text: DIES,
    },
  ],
});
