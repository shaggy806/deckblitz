import { defineCard } from "../define.js";

// EDHREC rank 8054.
//
// Rulings:
//   A card in your graveyard with {X} in its mana cost has X = 0.

const PLUS_TEXT = "+1: Put a +1/+1 counter on each of up to two target creatures.";
const MINUS_TEXT = "−2: Return target creature card with mana value 2 or less from your graveyard to the battlefield.";
const EMBLEM_TEXT = "At the beginning of your end step, create three 1/1 white Cat creature tokens with lifelink.";
const ULT_TEXT = `−7: You get an emblem with "${EMBLEM_TEXT}"`;

export default defineCard({
  name: "Ajani, Adversary of Tyrants",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Ajani"],
  loyalty: 4,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
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
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature", manaValue: { op: "lte", n: 2 } } }],
      effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM_TEXT,
        triggered: [
          {
            trigger: { on: "step-begins", step: "end", who: "you" },
            targets: [],
            effect: { kind: "create-token", token: "Lifelink Cat Token", count: 3 },
            resolve: null,
            text: EMBLEM_TEXT,
          },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
