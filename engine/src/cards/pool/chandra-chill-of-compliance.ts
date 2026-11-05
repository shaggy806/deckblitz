import { defineCard } from "../define.js";

// EDHREC rank 11427. The surveil's `then` reads the card it put into the
// graveyard (`thisWay: "put-into-graveyard"`, Enlightened Confidant's shape).

export default defineCard({
  name: "Chandra, Chill of Compliance",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Chandra"],
  loyalty: 3,
  text: "+1: Surveil 1. If you put a noncreature, nonland card into your graveyard this way, put that card into your hand.\n+1: Add {U}. Spend this mana only to cast a noncreature spell.\n−X: Tap target artifact or creature. Put X stun counters on it.\n−6: You get an emblem with \"Whenever you cast a spell, draw a card.\"",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "surveil",
        amount: 1,
        then: {
          kind: "return-from-graveyard",
          filter: { thisWay: "put-into-graveyard", notTypes: ["creature", "land"] },
          destination: "hand",
          count: "all",
        },
      },
      resolve: null,
      text: "+1: Surveil 1. If you put a noncreature, nonland card into your graveyard this way, put that card into your hand.",
    },
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "U",
        amount: 1,
        spendOnly: { spell: { notTypes: ["creature"] }, text: "Spend this mana only to cast a noncreature spell." },
      },
      resolve: null,
      text: "+1: Add {U}. Spend this mana only to cast a noncreature spell.",
    },
    {
      loyaltyCost: "-x",
      cost: { mana: null, tap: false },
      targets: ["artifact-or-creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: "x" },
        ],
      },
      resolve: null,
      text: "−X: Tap target artifact or creature. Put X stun counters on it.",
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: "Whenever you cast a spell, draw a card.",
        triggered: [
          {
            trigger: { on: "cast-spell", who: "you" },
            targets: [],
            effect: { kind: "draw", amount: 1 },
            resolve: null,
            text: "Whenever you cast a spell, draw a card.",
          },
        ],
      },
      resolve: null,
      text: "−6: You get an emblem with \"Whenever you cast a spell, draw a card.\"",
    },
  ],
});
