import { defineCard } from "../define.js";
import { ATTACKS_WHILE_SADDLED, saddle, saddleText } from "../helpers.js";

// "Attacks while saddled" is the trigger condition (rule 603.1): saddled as
// it's declared an attacker (the rulings), not asked again as it resolves.
const ATTACK_TEXT = "Whenever this creature attacks while saddled, it gets +2/+2 until end of turn.";

export default defineCard({
  name: "Alacrian Jaguar",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat", "Mount"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${ATTACK_TEXT}\n${saddleText(1)}`,
  triggered: [
    {
      ...ATTACKS_WHILE_SADDLED,
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [saddle(1, saddleText(1))],
});
