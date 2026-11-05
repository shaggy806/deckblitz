import { defineCard } from "../define.js";

const EMBLEM_TRIGGER =
  "Whenever an opponent is dealt combat damage by one or more creatures you control, if that player lost less than 8 life this turn, they lose life equal to the difference.";
const EMBLEM = `−8: You get an emblem with "${EMBLEM_TRIGGER}"`;

export default defineCard({
  name: "Lolth, Spider Queen",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Lolth"],
  loyalty: 4,
  text: `Whenever a creature you control dies, put a loyalty counter on Lolth.\n0: You draw a card and you lose 1 life.\n−3: Create two 2/1 black Spider creature tokens with reach and menace.\n${EMBLEM}`,
  activated: [
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1 },
        ],
      },
      resolve: null,
      text: "0: You draw a card and you lose 1 life.",
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "2/1 Black Spider Token (Menace, Reach)", count: 2 },
      resolve: null,
      text: "−3: Create two 2/1 black Spider creature tokens with reach and menace.",
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM_TRIGGER,
        triggered: [
          {
            trigger: { on: "deals-damage-batch", who: "you-control", filter: { type: "creature" }, to: "opponent", combat: true },
            condition: {
              kind: "of-player",
              player: "that-player",
              condition: { kind: "not", of: { kind: "turn-stat", stat: "life-lost", who: "you", atLeast: 8 } },
            },
            targets: [],
            effect: {
              kind: "lose-life",
              amount: { difference: [8, { turnStat: "life-lost", who: "trigger-player" }] },
              who: "trigger-player",
            },
            resolve: null,
            text: EMBLEM_TRIGGER,
          },
        ],
      },
      resolve: null,
      text: EMBLEM,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "loyalty", amount: 1 },
      resolve: null,
      text: "Whenever a creature you control dies, put a loyalty counter on Lolth.",
    },
  ],
});
