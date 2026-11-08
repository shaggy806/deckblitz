import { defineCard } from "../define.js";

// Mystery Booster Commander.
const DIES = "Whenever a creature dies, target opponent loses 1 life and you gain 1 life.";
const PLUS = "+1: Goad up to two target creatures.";
const MINUS =
  "−6: Each opponent exiles the top two cards of their library. Until end of turn, you may play those cards without paying their mana costs.";

export default defineCard({
  name: "Sifa Grent",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Sifa"],
  loyalty: 4,
  canBeCommander: true,
  text: `${DIES}\n${PLUS}\n${MINUS}\nSifa Grent can be your commander.`,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" } },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, target: 0 },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: DIES,
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [
        { kind: "optional", of: "creature" },
        { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "goad", target: 0 },
          { kind: "goad", target: 1 },
        ],
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "impulse-exile",
        amount: 2,
        whose: "each-opponent",
        duration: "end-of-turn",
        free: true,
        play: true,
      },
      resolve: null,
      text: MINUS,
    },
  ],
});
