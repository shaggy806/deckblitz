import { defineCard } from "../define.js";

// "Unless you discard" reads what was actually discarded: with no creature card
// in hand, or saying no, it's exiled. Its own card may be the dies trigger's
// target, and it's exiled before it could return (the ruling).
const ENTERS_TEXT = "When this creature enters, exile it unless you discard a creature card.";
const DIES_TEXT = "When this creature dies, exile it and return target creature card from your graveyard to the battlefield.";

export default defineCard({
  name: "Body Snatcher",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Minion"],
  power: 2,
  toughness: 2,
  text: `${ENTERS_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "may",
            prompt: "Discard a creature card to keep Body Snatcher?",
            effect: { kind: "discard", target: "you", amount: 1, filter: { type: "creature" } },
          },
          {
            kind: "conditional",
            condition: { kind: "not", of: { kind: "this-way", what: "discarded" } },
            then: { kind: "exile", target: "source" },
          },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "trigger-object" },
          { kind: "put-onto-battlefield", target: 0 },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
