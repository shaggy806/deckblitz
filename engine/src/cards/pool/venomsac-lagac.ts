import { defineCard } from "../define.js";
import { ATTACKS_WHILE_SADDLED, saddle, saddleText } from "../helpers.js";

const ATTACK_TEXT = "Whenever this creature attacks while saddled, it gets +0/+3 until end of turn.";

export default defineCard({
  name: "Venomsac Lagac",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Lizard", "Mount"],
  power: 2,
  toughness: 1,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${ATTACK_TEXT}\n${saddleText(2)}`,
  triggered: [
    {
      ...ATTACKS_WHILE_SADDLED,
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 0, toughness: 3, duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [saddle(2, saddleText(2))],
});
