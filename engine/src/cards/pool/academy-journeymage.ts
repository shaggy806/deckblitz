import { defineCard } from "../define.js";

// EDHREC rank 21775.
//
// Rulings:
//   [2018-04-27] If you control more than one Wizard, Academy Journeymage's cost is reduced by
//     only {1}.
//
// Arcane Epiphany's cost reduction.

const ENTERS_TEXT = "When this creature enters, return target creature an opponent controls to its owner's hand.";

export default defineCard({
  name: "Academy Journeymage",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 2,
  text: `This spell costs {1} less to cast if you control a Wizard.\n${ENTERS_TEXT}`,
  selfCostReduction: {
    condition: { kind: "controls", filter: { subtype: "Wizard" }, atLeast: 1 },
    reduceGeneric: 1,
  },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
