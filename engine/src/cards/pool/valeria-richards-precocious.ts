import { defineCard } from "../define.js";

// EDHREC rank 11106.
//
// "Your first noncreature spell each turn" is the first *matching* spell
// (`firstEachTurn` with a filter — Esper Sentinel's shape), not the first
// spell of the turn.
const COST_TEXT = "Noncreature spells you cast cost {1} less to cast.";
const DRAW_TEXT = "Whenever you cast your first noncreature spell each turn, draw a card.";

export default defineCard({
  name: "Valeria Richards, Precocious",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist", "Hero"],
  power: 3,
  toughness: 3,
  text: `${COST_TEXT}\n${DRAW_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { notTypes: ["creature"] }, caster: "you", reduceGeneric: 1 },
      text: COST_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", firstEachTurn: true, filter: { notTypes: ["creature"] } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
