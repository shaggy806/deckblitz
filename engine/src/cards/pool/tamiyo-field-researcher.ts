import { defineCard } from "../define.js";

const WATCH = "whenever either of those creatures deals combat damage, you draw a card.";
const PLUS = `+1: Choose up to two target creatures. Until your next turn, ${WATCH}`;
const MINUS = "−2: Tap up to two target nonland permanents. They don't untap during their controller's next untap step.";
const FREE = "You may cast spells from your hand without paying their mana costs.";
const ULT = `−7: Draw three cards. You get an emblem with "${FREE}"`;

export default defineCard({
  name: "Tamiyo, Field Researcher",
  manaCost: "{1}{G}{W}{U}",
  colors: ["G", "W", "U"],
  types: ["planeswalker"],
  supertypes: ["legendary"],
  subtypes: ["Tamiyo"],
  loyalty: 4,
  text: `${PLUS}\n${MINUS}\n${ULT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [
        { kind: "optional", of: "creature" },
        { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } },
      ],
      effect: {
        kind: "delayed-trigger",
        at: {
          whenever: { on: "deals-damage", who: "self", combat: true },
          watching: "targets",
          until: "until-your-next-turn",
        },
        effect: { kind: "draw", amount: 1 },
        text: `Until your next turn, ${WATCH}`,
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [
        { kind: "optional", of: "nonland-permanent" },
        { kind: "optional", of: { kind: "other", of: "nonland-permanent", than: { slot: 0 } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0, doesntUntapNext: true },
          { kind: "tap", target: 1, doesntUntapNext: true },
        ],
      },
      resolve: null,
      text: MINUS,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 3 },
          {
            kind: "create-emblem",
            text: FREE,
            static: {
              affects: { scope: "self" },
              alternativeCostForSpells: { mana: "{0}", when: { castFrom: "hand" } },
              text: FREE,
            },
          },
        ],
      },
      resolve: null,
      text: ULT,
    },
  ],
});
