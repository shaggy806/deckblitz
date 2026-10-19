import { defineCard } from "../define.js";

// EDHREC rank 14450.
//
// Fiendish Panda's dies trigger: "this creature's power" is the power it died with (608.2h), and
// "another" is Junk Diver's `other` — the Anointer's own card in the graveyard can't be chosen.

const DRAW_TEXT = "Whenever you draw your second card each turn, put a +1/+1 counter on this creature.";
const DIES_TEXT =
  "When this creature dies, return another target creature card with mana value less than or equal to this creature's power from your graveyard to the battlefield.";

export default defineCard({
  name: "Gurgling Anointer",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Horror"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${DRAW_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [
        {
          kind: "other",
          of: {
            kind: "card-in-graveyard",
            whose: "you",
            filter: {
              type: "creature",
              manaValue: { op: "lte", n: { amount: { powerOf: "trigger-object" } } },
            },
          },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
