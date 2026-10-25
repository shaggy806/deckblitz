import { defineCard } from "../define.js";

const UPKEEP_TEXT = "At the beginning of your upkeep, sacrifice this artifact.";
const GRAVEYARD_TEXT = "When this artifact is put into a graveyard from the battlefield, it deals 3 damage to any target.";

export default defineCard({
  name: "Goblin Boom Keg",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${UPKEEP_TEXT}\n${GRAVEYARD_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: GRAVEYARD_TEXT,
    },
  ],
});
