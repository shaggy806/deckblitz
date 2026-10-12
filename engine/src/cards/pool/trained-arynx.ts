import { defineCard } from "../define.js";
import { ATTACKS_WHILE_SADDLED, saddle, saddleText } from "../helpers.js";

const ATTACK_TEXT =
  "Whenever this creature attacks while saddled, it gains first strike until end of turn. Scry 1. (Look at the top card of your library. You may put that card on the bottom.)";

export default defineCard({
  name: "Trained Arynx",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Beast", "Mount"],
  power: 3,
  toughness: 1,
  text: `${ATTACK_TEXT}\n${saddleText(2)}`,
  triggered: [
    {
      ...ATTACKS_WHILE_SADDLED,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "end-of-turn" },
          { kind: "scry", amount: 1 },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [saddle(2, saddleText(2))],
});
