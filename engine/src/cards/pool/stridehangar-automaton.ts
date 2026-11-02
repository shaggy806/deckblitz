import { defineCard } from "../define.js";

const LORD_TEXT = "Thopters you control get +1/+1.";
const TOKEN_TEXT =
  "If one or more artifact tokens would be created under your control, those tokens plus an additional 1/1 colorless Thopter artifact creature token with flying are created instead.";

export default defineCard({
  name: "Stridehangar Automaton",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 1,
  toughness: 4,
  text: `${LORD_TEXT}\n${TOKEN_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Thopter", controlledBy: "you" } },
      grantPt: [1, 1],
      text: LORD_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-create-token",
        plusOneToken: "Thopter Token",
        ofTokens: { type: "artifact" },
      },
      text: TOKEN_TEXT,
    },
  ],
});
