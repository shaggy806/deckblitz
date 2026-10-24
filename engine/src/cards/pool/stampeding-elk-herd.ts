import { defineCard } from "../define.js";

// EDHREC rank 22141. Formidable — an intervening if (rule 603.4): checked as
// it triggers and again as it resolves (the ruling).
const ATTACK_TEXT =
  "Formidable — Whenever this creature attacks, if creatures you control have total power 8 or greater, creatures you control gain trample until end of turn.";

export default defineCard({
  name: "Stampeding Elk Herd",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elk"],
  power: 5,
  toughness: 5,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: {
        kind: "aggregate",
        value: { aggregate: "sum", of: "power", filter: { type: "creature", controlledBy: "you" } },
        compare: { op: "gte", n: 8 },
      },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "trample",
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
