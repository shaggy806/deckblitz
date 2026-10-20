import { defineCard } from "../define.js";

const ENTERS_TEXT = "When this creature enters, create two 1/1 green Squirrel creature tokens.";
const PUMP_TEXT = "{3}{B}: Squirrels you control get +1/+0 and gain menace until end of turn.";

export default defineCard({
  name: "Drey Keeper",
  manaCost: "{3}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 2,
  toughness: 2,
  text: `${ENTERS_TEXT}\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Squirrel Token", count: 2 },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{B}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", subtype: "Squirrel", controlledBy: "you" },
            power: 1,
            toughness: 0,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", subtype: "Squirrel", controlledBy: "you" },
            keyword: "menace",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
