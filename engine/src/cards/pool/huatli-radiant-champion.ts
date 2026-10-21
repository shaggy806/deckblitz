import { defineCard } from "../define.js";

const PLUS_TEXT = "+1: Put a loyalty counter on Huatli for each creature you control.";
const MINUS_TEXT = "−1: Target creature gets +X/+X until end of turn, where X is the number of creatures you control.";
const EMBLEM = "Whenever a creature you control enters, you may draw a card.";
const ULT_TEXT = `−8: You get an emblem with "${EMBLEM}"`;

const CREATURES_YOU_CONTROL = { countOf: { type: "creature", controlledBy: "you" } } as const;

export default defineCard({
  name: "Huatli, Radiant Champion",
  manaCost: "{2}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Huatli"],
  loyalty: 3,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      // Counted as it resolves (the ruling); none with no creatures.
      effect: { kind: "add-counter", target: "source", counter: "loyalty", amount: CREATURES_YOU_CONTROL },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: CREATURES_YOU_CONTROL,
        toughness: CREATURES_YOU_CONTROL,
        duration: "end-of-turn",
      },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM,
        triggered: [
          {
            trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
            targets: [],
            effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
            resolve: null,
            text: EMBLEM,
          },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
