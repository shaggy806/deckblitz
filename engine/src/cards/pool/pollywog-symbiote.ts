import { defineCard } from "../define.js";

const COST_TEXT = "Each creature spell you cast costs {1} less to cast if it has mutate.";
const TRIGGER_TEXT = "Whenever you cast a creature spell, if it has mutate, draw a card, then discard a card.";

// Both apply to a creature spell with mutate however it's cast, for its
// mutate cost or not (the ruling). Having mutate is a fixed property of the
// spell, so the intervening-if is the trigger's filter.
export default defineCard({
  name: "Pollywog Symbiote",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Frog"],
  power: 1,
  toughness: 3,
  text: `${COST_TEXT}\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { type: "creature", hasMutate: true }, caster: "you", reduceGeneric: 1 },
      text: COST_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature", hasMutate: true } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
