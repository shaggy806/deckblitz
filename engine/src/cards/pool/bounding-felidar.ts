import { defineCard } from "../define.js";
import { ATTACKS_WHILE_SADDLED, saddle, saddleText } from "../helpers.js";

// "Each of those creatures" is each other creature you control as it
// resolves — counted whether or not a counter could go on it (the ruling).
const ATTACK_TEXT =
  "Whenever this creature attacks while saddled, put a +1/+1 counter on each other creature you control. You gain 1 life for each of those creatures.";

export default defineCard({
  name: "Bounding Felidar",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Beast", "Mount"],
  power: 4,
  toughness: 7,
  text: `${ATTACK_TEXT}\n${saddleText(2)}`,
  triggered: [
    {
      ...ATTACKS_WHILE_SADDLED,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "add-counter-all",
            filter: { type: "creature", controlledBy: "you" },
            counter: "+1/+1",
            amount: 1,
            exceptSource: true,
          },
          { kind: "gain-life", amount: { countOf: { type: "creature", controlledBy: "you" }, excludeSelf: true } },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [saddle(2, saddleText(2))],
});
