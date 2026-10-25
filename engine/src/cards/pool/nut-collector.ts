import { defineCard } from "../define.js";

const UPKEEP_TEXT = "At the beginning of your upkeep, you may create a 1/1 green Squirrel creature token.";
const THRESHOLD_TEXT =
  "Threshold — All Squirrels get +2/+2 as long as there are seven or more cards in your graveyard.";

export default defineCard({
  name: "Nut Collector",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 1,
  toughness: 1,
  text: `${UPKEEP_TEXT}\n${THRESHOLD_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Create a 1/1 green Squirrel creature token?",
        effect: { kind: "create-token", token: "Squirrel Token", count: 1 },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  static: [
    {
      // Every Squirrel, whoever controls it.
      affects: { scope: "filter", filter: { type: "creature", subtype: "Squirrel" } },
      condition: { kind: "threshold" },
      grantPt: [2, 2],
      text: THRESHOLD_TEXT,
    },
  ],
});
