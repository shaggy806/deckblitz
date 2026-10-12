import { defineCard } from "../define.js";
import { ATTACKS_WHILE_SADDLED, saddle, saddleText } from "../helpers.js";

// The creatures you control as it resolves (rule 611.2c).
const ATTACK_TEXT = "Whenever this creature attacks while saddled, creatures you control gain trample until end of turn.";

export default defineCard({
  name: "Drover Grizzly",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Bear", "Mount"],
  power: 4,
  toughness: 2,
  text: `${ATTACK_TEXT}\n${saddleText(1)}`,
  triggered: [
    {
      ...ATTACKS_WHILE_SADDLED,
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
  activated: [saddle(1, saddleText(1))],
});
