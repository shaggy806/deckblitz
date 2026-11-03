import { defineCard } from "../define.js";

const DRAW_TEXT = "Whenever a creature you control with power 4 or greater enters, draw a card.";
const LANDS_TEXT = "+2: Untap up to two target lands.";
const BEAST_TEXT = "−3: Create a 4/4 green Beast creature token with trample.";
const ATTACK_TEXT =
  "−4: Until your next turn, whenever one or more creatures attack one of your opponents, those creatures get +2/+2 and gain trample until end of turn.";

export default defineCard({
  name: "Garruk, Curse Breaker",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Garruk"],
  loyalty: 5,
  text: `${DRAW_TEXT}\n${LANDS_TEXT}\n${BEAST_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you",
        filter: { type: "creature", controlledBy: "you", power: { op: "gte", n: 4 } },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [
        { kind: "optional", of: "land" },
        { kind: "optional", of: { kind: "other", of: "land", than: { slot: 0 } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: 0 },
          { kind: "untap", target: 1 },
        ],
      },
      resolve: null,
      text: LANDS_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Beast Token (Garruk, Veiled Butcher)", count: 1 },
      resolve: null,
      text: BEAST_TEXT,
    },
    {
      loyaltyCost: -4,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: {
          whenever: { on: "attacks-player", who: "any", defender: "opponent" },
          until: "your-next-turn",
        },
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt-all", filter: { triggerBatch: true }, power: 2, toughness: 2, duration: "end-of-turn" },
            { kind: "grant-keyword-all", filter: { triggerBatch: true }, keyword: "trample", duration: "end-of-turn" },
          ],
        },
        text: "Whenever one or more creatures attack one of your opponents, those creatures get +2/+2 and gain trample until end of turn.",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
