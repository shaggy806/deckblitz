import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 16876.
//
// Rulings:
//   [2004-10-04] Only affects Squirrels on the battlefield when the ability resolves.
//
// "Squirrel creatures" is every Squirrel on the battlefield, whoever controls it; a
// `modify-pt-all` locks in the set as it resolves (the ruling).

const TOKENS_TEXT = "{1}{G}, Sacrifice a land: Create two 1/1 green Squirrel creature tokens.";
const PUMP_TEXT = "{1}{G}, Sacrifice a land: Squirrel creatures get +1/+1 until end of turn.";

export default defineCard({
  name: "Squirrel Wrangler",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 2,
  toughness: 2,
  text: `${TOKENS_TEXT}\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false, sacrifice: { filter: { type: "land" } } },
      targets: [],
      effect: { kind: "create-token", token: "Squirrel Token", count: 2 },
      resolve: null,
      text: TOKENS_TEXT,
    },
    {
      cost: { mana: "{1}{G}", tap: false, sacrifice: { filter: { type: "land" } } },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", subtype: "Squirrel" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
