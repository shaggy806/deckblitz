import { defineCard } from "../define.js";

const FORMIDABLE_TEXT =
  "Formidable — Whenever this creature attacks, if creatures you control have total power 8 or greater, this creature gains first strike until end of turn.";

export default defineCard({
  name: "Sabertooth Outrider",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 4,
  toughness: 2,
  keywords: ["trample"],
  text: `Trample\n${FORMIDABLE_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: {
        kind: "aggregate",
        value: { aggregate: "sum", of: "power", filter: { type: "creature", controlledBy: "you" } },
        compare: { op: "gte", n: 8 },
      },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "end-of-turn" },
      resolve: null,
      text: FORMIDABLE_TEXT,
    },
  ],
});
