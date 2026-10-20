import { defineCard } from "../define.js";

const COST_TEXT = "Instant and sorcery spells you cast cost {1} less to cast.";
const PLUS_TEXT =
  "+1: Rowan deals 1 damage to each opponent. If you've drawn three or more cards this turn, she deals 3 damage to each opponent instead.";
const EMBLEM_TEXT =
  "Whenever you cast an instant or sorcery spell, you may pay {2}. If you do, copy that spell. You may choose new targets for the copy.";
const MINUS_TEXT = `−4: You get an emblem with "${EMBLEM_TEXT}"`;

export default defineCard({
  name: "Rowan, Scholar of Sparks",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Rowan"],
  loyalty: 2,
  text: `${COST_TEXT}\n${PLUS_TEXT}\n${MINUS_TEXT}`,
  // Reduces only generic mana (the ruling).
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { typesAnyOf: ["instant", "sorcery"] }, caster: "you", reduceGeneric: 1 },
      text: COST_TEXT,
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "turn-stat", stat: "cards-drawn", who: "you", atLeast: 3 },
        then: { kind: "damage", amount: 3, who: "each-opponent" },
        else: { kind: "damage", amount: 1, who: "each-opponent" },
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -4,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM_TEXT,
        triggered: [
          {
            trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
            targets: [],
            // {2} can be paid only once (the ruling).
            effect: {
              kind: "may",
              prompt: "Pay {2} to copy that spell?",
              cost: "{2}",
              effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
            },
            resolve: null,
            text: EMBLEM_TEXT,
          },
        ],
      },
      resolve: null,
      text: MINUS_TEXT,
    },
  ],
  faces: ["Rowan, Scholar of Sparks", "Will, Scholar of Frost"],
});
