import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

const COST_TEXT = "Instant and sorcery spells you cast cost {1} less to cast.";
const PLUS_TEXT = "+1: Up to one target creature has base power and toughness 0/2 until your next turn.";
const DRAW_TEXT = "−3: Draw two cards.";
const ULT_TEXT =
  "−7: Exile up to five target permanents. For each permanent exiled this way, its controller creates a 4/4 blue and red Elemental creature token.";

export default defineCard({
  name: "Will, Scholar of Frost",
  art: "https://cards.scryfall.io/art_crop/back/1/8/18c16872-3675-4a4d-962a-2e17ad6f3886.jpg",
  manaCost: "{4}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Will"],
  loyalty: 4,
  text: `${COST_TEXT}\n${PLUS_TEXT}\n${DRAW_TEXT}\n${ULT_TEXT}`,
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
      targets: [{ kind: "optional", of: "creature" }],
      // Base P/T (layer 7b): pumps and counters still apply over it (the ruling).
      effect: {
        kind: "animate",
        target: 0,
        power: 0,
        toughness: 2,
        addTypes: [],
        addSubtypes: [],
        duration: "until-your-next-turn",
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "draw", amount: 2 },
      resolve: null,
      text: DRAW_TEXT,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: distinctTargets(5, "permanent", { optional: true }),
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "sequence",
            simultaneous: true,
            effects: [
              { kind: "exile", target: 0 },
              { kind: "exile", target: 1 },
              { kind: "exile", target: 2 },
              { kind: "exile", target: 3 },
              { kind: "exile", target: 4 },
            ],
          },
          {
            kind: "create-token",
            token: "4/4 Blue Red Elemental Token",
            who: "each-player",
            count: { thisWay: "exiled", who: "each" },
          },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
  faces: ["Rowan, Scholar of Sparks", "Will, Scholar of Frost"],
});
