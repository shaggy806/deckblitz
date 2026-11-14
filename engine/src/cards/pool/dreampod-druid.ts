import { defineCard } from "../define.js";

// An intervening "if" (rule 603.4): asked as each upkeep begins and again as
// it resolves, read as the Druid last existed if it has left (the rulings).
const UPKEEP_TEXT = "At the beginning of each upkeep, if this creature is enchanted, create a 1/1 green Saproling creature token.";

export default defineCard({
  name: "Dreampod Druid",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 2,
  toughness: 2,
  text: UPKEEP_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      condition: { kind: "source", filter: { enchanted: true } },
      targets: [],
      effect: { kind: "create-token", token: "Saproling Token", count: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
