import { defineCard } from "../define.js";

// Makes Bird → uses "Bird Token".
const CREATE_TEXT =
  "Whenever you create one or more tokens for the first time each turn, create a 1/1 white Bird creature token with flying.";
const GRANT_TEXT = "{3}{U}{R}{W}: Creature tokens you control gain double strike until end of turn.";

export default defineCard({
  name: "Akim, the Soaring Wind",
  manaCost: "{2}{U}{R}{W}",
  colors: ["U", "R", "W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Bird", "Dinosaur"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${CREATE_TEXT}\n${GRANT_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { token: true },
        batched: true,
        firstCreationEachTurn: true,
      },
      targets: [],
      effect: { kind: "create-token", token: "Bird Token", count: 1 },
      resolve: null,
      text: CREATE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{U}{R}{W}", tap: false },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", token: true, controlledBy: "you" },
        keyword: "double-strike",
        duration: "end-of-turn",
      },
      resolve: null,
      text: GRANT_TEXT,
    },
  ],
});
