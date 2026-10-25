import { defineCard } from "../define.js";

// EDHREC rank 11418.
//
// The +1 reaches only the creatures you control as it resolves (the ruling),
// each until your next turn. The emblem's trigger works from the command zone
// (rule 114.4); "that player" is the opponent whose upkeep it is, and one
// with no creature sacrifices nothing (the ruling).

const PLUS = "+1: Until your next turn, creatures you control get +1/+0 and gain lifelink.";
const MINUS = "−2: Create a 2/2 black Vampire creature token with flying.";
const EMBLEM = "At the beginning of each opponent's upkeep, that player sacrifices a creature of their choice.";
const ULTIMATE = `−6: You get an emblem with "${EMBLEM}"`;

export default defineCard({
  name: "Sorin, Solemn Visitor",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Sorin"],
  loyalty: 4,
  text: `${PLUS}\n${MINUS}\n${ULTIMATE}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 1,
            toughness: 0,
            duration: "until-your-next-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "lifelink",
            duration: "until-your-next-turn",
          },
        ],
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Vampire Token", count: 1 },
      resolve: null,
      text: MINUS,
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM,
        triggered: [
          {
            trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
            targets: [],
            effect: { kind: "sacrifice", who: "active-player", filter: { type: "creature" }, count: 1 },
            resolve: null,
            text: EMBLEM,
          },
        ],
      },
      resolve: null,
      text: ULTIMATE,
    },
  ],
});
