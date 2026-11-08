import { defineCard } from "../define.js";

const HEXPROOF_TEXT =
  "Each creature you control that you've put one or more +1/+1 counters on this turn has hexproof.";
const DRAW_TEXT = "Whenever you draw your second card each turn, put a +1/+1 counter on Kid Loki.";

export default defineCard({
  name: "Kid Loki",
  manaCost: "{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["God", "Hero", "Villain"],
  power: 1,
  toughness: 1,
  text: `${HEXPROOF_TEXT}\n${DRAW_TEXT}`,
  static: [
    {
      // "That you've put": the journal's counters, those this player put, on
      // that creature in the stint it's in now.
      affects: {
        scope: "filter",
        filter: {
          type: "creature",
          controlledBy: "you",
          journaled: { what: "counters-put", by: "you", counter: "+1/+1" },
        },
      },
      grantKeywords: ["hexproof"],
      text: HEXPROOF_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
