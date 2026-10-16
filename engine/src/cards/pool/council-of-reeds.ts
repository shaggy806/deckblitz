import { defineCard } from "../define.js";

// EDHREC rank 12494. Marvel Super Heroes Commander.
//
// The copy is of Council of Reeds as it is (or last was, if it has left —
// rule 608.2h), made under the ability's controller's control.

const LEGEND_TEXT = "The \"legend rule\" doesn't apply to creatures you control.";
const COPY_TEXT =
  "At the beginning of combat on your turn, if you've cast a noncreature spell this turn, create a token that's a copy of Council of Reeds.";

export default defineCard({
  name: "Council of Reeds",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist", "Hero"],
  power: 2,
  toughness: 2,
  text: `${LEGEND_TEXT}\n${COPY_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you" } },
      legendRuleOff: true,
      text: LEGEND_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "cast-this-turn", filter: { notTypes: ["creature"] } },
      targets: [],
      effect: { kind: "create-token-copy", of: "source", count: 1, who: "you" },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
