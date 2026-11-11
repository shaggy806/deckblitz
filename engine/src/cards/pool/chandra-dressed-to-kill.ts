import { defineCard } from "../define.js";

// EDHREC rank 6560.
//
// Rulings:
//   The second ability checks the characteristics of the card you exiled to
//   see if it's red; if the card is red but the spell it becomes isn't, you
//   may still cast it.
//   The last ability only lets you cast spells that are red as you cast them,
//   no matter what the card in exile is.
//   You must pay all costs; for the middle ability you must also follow all
//   timing restrictions.
//   The emblem looks for the actual amount of mana spent to cast the spell.
//
// The +1 asks the exiled card's own colour (a `this-way` condition) and then
// names that card; the −7's permission is `spell`, judged on the face cast.

const MANA_TEXT = "+1: Add {R}. Chandra deals 1 damage to up to one target player or planeswalker.";
const IMPULSE_TEXT = "+1: Exile the top card of your library. If it's red, you may cast it this turn.";
const EMBLEM_TEXT =
  "Whenever you cast a red spell, this emblem deals X damage to any target, where X is the amount of mana spent to cast that spell.";
const ULT_TEXT = `−7: Exile the top five cards of your library. You may cast red spells from among them this turn. You get an emblem with "${EMBLEM_TEXT}"`;

export default defineCard({
  name: "Chandra, Dressed to Kill",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Chandra"],
  loyalty: 3,
  text: `${MANA_TEXT}\n${IMPULSE_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "player-or-planeswalker" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-mana", mana: "R", amount: 1 },
          { kind: "damage", amount: 1, target: 0 },
        ],
      },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-from-library", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled", filter: { colors: ["R"] }, atLeast: 1 },
            then: { kind: "grant-play", cards: { thisWay: "exiled" }, duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: IMPULSE_TEXT,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "impulse-exile", amount: 5, duration: "end-of-turn", spell: { colors: ["R"] } },
          {
            kind: "create-emblem",
            text: EMBLEM_TEXT,
            triggered: [
              {
                trigger: { on: "cast-spell", who: "you", filter: { colors: ["R"] } },
                targets: ["any-target"],
                effect: { kind: "damage", amount: { manaSpentOf: "trigger-object" }, target: 0 },
                resolve: null,
                text: EMBLEM_TEXT,
              },
            ],
          },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
