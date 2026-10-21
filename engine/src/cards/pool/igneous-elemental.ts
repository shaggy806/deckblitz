import { defineCard } from "../define.js";

// Ruling: still only {2} less with more than one land card in the graveyard.
const ENTERS_TEXT = "When this creature enters, you may have it deal 2 damage to target creature.";

export default defineCard({
  name: "Igneous Elemental",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 3,
  text: `This spell costs {2} less to cast if there is a land card in your graveyard.\n${ENTERS_TEXT}`,
  selfCostReduction: {
    condition: { kind: "cards-in-graveyard", atLeast: 1, filter: { type: "land" } },
    reduceGeneric: 2,
  },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Have Igneous Elemental deal 2 damage to the targeted creature?",
        effect: { kind: "damage", amount: 2, target: 0 },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
