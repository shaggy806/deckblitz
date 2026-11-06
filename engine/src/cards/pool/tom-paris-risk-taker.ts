import { defineCard } from "../define.js";

// Star Trek Commander (TRC).

const TEXT =
  "Seek out — Whenever you draw your second card each turn, creatures you control gain flying, double strike, vigilance, and haste until end of turn.";
const YOURS = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Tom Paris, Risk-Taker",
  manaCost: "{4}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Pilot"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword-all", filter: YOURS, keyword: "flying", duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: YOURS, keyword: "double-strike", duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: YOURS, keyword: "vigilance", duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: YOURS, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
