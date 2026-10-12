import { defineCard } from "../define.js";
import { maxSpeed, START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 6416.
const ENTERS_TEXT = "When this artifact enters, draw two cards, then discard a card.";
const COST_TEXT = "Spells you cast cost {1} less to cast.";

export default defineCard({
  name: "Racers' Scoreboard",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  keywords: ["start-your-engines"],
  text: `${START_YOUR_ENGINES_TEXT}\n${ENTERS_TEXT}\nMax speed — ${COST_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [
    maxSpeed({
      costModification: { applies: {}, caster: "you", reduceGeneric: 1 },
      text: `Max speed — ${COST_TEXT}`,
    }),
  ],
});
