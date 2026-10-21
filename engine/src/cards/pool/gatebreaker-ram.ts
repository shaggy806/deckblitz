import { defineCard } from "../define.js";

// Ravnica Allegiance.
const PT_TEXT = "This creature gets +1/+1 for each Gate you control.";
const KEYWORD_TEXT = "As long as you control two or more Gates, this creature has vigilance and trample.";

export default defineCard({
  name: "Gatebreaker Ram",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Sheep"],
  power: 2,
  toughness: 2,
  text: `${PT_TEXT}\n${KEYWORD_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtype: "Gate", controlledBy: "you" }, pt: [1, 1] },
      text: PT_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Gate" }, atLeast: 2 },
      grantKeywords: ["vigilance", "trample"],
      text: KEYWORD_TEXT,
    },
  ],
});
