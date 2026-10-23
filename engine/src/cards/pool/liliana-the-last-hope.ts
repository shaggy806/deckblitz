import { defineCard } from "../define.js";

const PLUS_TEXT = "+1: Up to one target creature gets -2/-1 until your next turn.";
const MINUS_TEXT = "−2: Mill two cards, then you may return a creature card from your graveyard to your hand.";
const EMBLEM_TRIGGER_TEXT =
  "At the beginning of your end step, create X 2/2 black Zombie creature tokens, where X is two plus the number of Zombies you control.";
const ULT_TEXT = `−7: You get an emblem with "${EMBLEM_TRIGGER_TEXT}"`;

// Rulings: the −2's creature card isn't targeted (any creature card in the
// graveyard after the mill); the +1 may have no target; the emblem counts
// the Zombies you control as its trigger resolves (two with none).
export default defineCard({
  name: "Liliana, the Last Hope",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Liliana"],
  loyalty: 3,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "modify-pt", target: 0, power: -2, toughness: -1, duration: "until-your-next-turn" },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 2 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 0,
            max: 1,
            destination: "hand",
            leftover: "stay",
            filter: { type: "creature" },
          },
        ],
      },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM_TRIGGER_TEXT,
        triggered: [
          {
            trigger: { on: "step-begins", step: "end", who: "you" },
            targets: [],
            effect: {
              kind: "create-token",
              token: "Zombie Token",
              count: { sum: [2, { countOf: { subtype: "Zombie", controlledBy: "you" } }] },
            },
            resolve: null,
            text: EMBLEM_TRIGGER_TEXT,
          },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
