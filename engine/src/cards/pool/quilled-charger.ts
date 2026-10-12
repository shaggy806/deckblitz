import { defineCard } from "../define.js";
import { ATTACKS_WHILE_SADDLED, saddle, saddleText } from "../helpers.js";

const ATTACK_TEXT =
  "Whenever this creature attacks while saddled, it gets +1/+2 and gains menace until end of turn. (It can't be blocked except by two or more creatures.)";

export default defineCard({
  name: "Quilled Charger",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Porcupine", "Mount"],
  power: 4,
  toughness: 3,
  text: `${ATTACK_TEXT}\n${saddleText(2)}`,
  triggered: [
    {
      ...ATTACKS_WHILE_SADDLED,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 2, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "menace", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [saddle(2, saddleText(2))],
});
