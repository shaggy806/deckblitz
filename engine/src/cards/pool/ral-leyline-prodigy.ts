import { defineCard } from "../define.js";

const ENTER_TEXT =
  "Ral enters with an additional loyalty counter on him for each instant and sorcery spell you've cast this turn.";
const PLUS_TEXT = "+1: Until your next turn, instant and sorcery spells you cast cost {1} less to cast.";
const MINUS_TEXT =
  "−2: Ral deals 2 damage divided as you choose among one or two targets. Draw a card if you control a blue permanent other than Ral.";
const ULT_TEXT =
  "−8: Exile the top eight cards of your library. You may cast instant and sorcery spells from among them this turn without paying their mana costs.";

/** Ral, Monsoon Mage's back face. The +1's reduction is a `player-effect`
 * (it outlives Ral). */
export default defineCard({
  name: "Ral, Leyline Prodigy",
  art: "https://cards.scryfall.io/art_crop/back/4/3/438d8a26-ddc9-4829-8aff-22d6af6575cf.jpg",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Ral"],
  loyalty: 2,
  text: `${ENTER_TEXT}\n${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "loyalty", amount: { castThisTurn: { typesAnyOf: ["instant", "sorcery"] } } },
      },
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "player-effect",
        duration: "until-your-next-turn",
        reduceSpells: { applies: { typesAnyOf: ["instant", "sorcery"] }, reduceGeneric: 1 },
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [{ kind: "any-number", of: "any-target", min: 1, max: 2 }],
      divided: { total: 2, slot: 0 },
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage-divided", from: 0 },
          {
            kind: "conditional",
            condition: { kind: "controls", filter: { colors: ["U"] }, atLeast: 1, excludeSelf: true },
            then: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "impulse-exile",
        amount: 8,
        duration: "end-of-turn",
        filter: { typesAnyOf: ["instant", "sorcery"] },
        free: true,
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
  faces: ["Ral, Monsoon Mage", "Ral, Leyline Prodigy"],
  transform: true,
});
