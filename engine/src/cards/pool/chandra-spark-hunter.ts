import { defineCard } from "../define.js";

// EDHREC rank 6367. The emblem is colorless (the ruling), so its damage can
// target a permanent with protection from red.
const COMBAT_TEXT =
  "At the beginning of combat on your turn, choose up to one target Vehicle you control. Until end of turn, it becomes an artifact creature and gains haste.";
const LOOT_TEXT = "+2: You may sacrifice an artifact or discard a card. If you do, draw a card.";
const TOKEN_TEXT = "0: Create a 3/2 colorless Vehicle artifact token with crew 1.";
const EMBLEM = "Whenever an artifact you control enters, this emblem deals 3 damage to any target.";
const ULTIMATE = `−7: You get an emblem with "${EMBLEM}"`;

export default defineCard({
  name: "Chandra, Spark Hunter",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Chandra"],
  loyalty: 4,
  text: `${COMBAT_TEXT}\n${LOOT_TEXT}\n${TOKEN_TEXT}\n${ULTIMATE}`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Sacrifice an artifact or discard a card to draw a card?",
        effect: {
          kind: "modal",
          minModes: 1,
          maxModes: 1,
          modes: [
            {
              text: "Sacrifice an artifact.",
              effect: {
                kind: "sequence",
                effects: [
                  { kind: "sacrifice", who: "you", filter: { type: "artifact" }, count: 1 },
                  {
                    kind: "conditional",
                    condition: { kind: "this-way", what: "sacrificed", who: "you" },
                    then: { kind: "draw", amount: 1 },
                  },
                ],
              },
            },
            {
              text: "Discard a card.",
              effect: {
                kind: "sequence",
                effects: [
                  { kind: "discard", target: "you", amount: 1 },
                  {
                    kind: "conditional",
                    condition: { kind: "this-way", what: "discarded" },
                    then: { kind: "draw", amount: 1 },
                  },
                ],
              },
            },
          ],
        },
      },
      resolve: null,
      text: LOOT_TEXT,
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Vehicle Token", count: 1 },
      resolve: null,
      text: TOKEN_TEXT,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM,
        triggered: [
          {
            trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "artifact" } },
            targets: ["any-target"],
            effect: { kind: "damage", amount: 3, target: 0 },
            resolve: null,
            text: EMBLEM,
          },
        ],
      },
      resolve: null,
      text: ULTIMATE,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "optional", of: { kind: "permanent", whose: "you", filter: { subtype: "Vehicle" } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-types", target: 0, addTypes: ["artifact", "creature"], duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
