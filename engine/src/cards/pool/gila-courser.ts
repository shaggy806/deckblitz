import { defineCard } from "../define.js";
import { ATTACKS_WHILE_SADDLED, saddle, saddleText } from "../helpers.js";

// Played under the normal timing rules and costs (the ruling).
const ATTACK_TEXT =
  "Whenever this creature attacks while saddled, exile the top card of your library. Until the end of your next turn, you may play that card.";

export default defineCard({
  name: "Gila Courser",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Mount"],
  power: 4,
  toughness: 2,
  text: `${ATTACK_TEXT}\n${saddleText(1)}`,
  triggered: [
    {
      ...ATTACKS_WHILE_SADDLED,
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "your-next-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [saddle(1, saddleText(1))],
});
