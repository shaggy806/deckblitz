import { defineCard } from "../define.js";

// "Cycled or discarded": cycling is discarding (rule 702.29a), so a cycled card
// is on the turn's discard list once and counts once.
export default defineCard({
  name: "Hollow One",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 4,
  toughness: 4,
  text: "This spell costs {2} less to cast for each card you've cycled or discarded this turn.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { product: [{ turnHistory: "discarded" }, 2] },
  },
  cycling: { cost: "{2}" },
});
