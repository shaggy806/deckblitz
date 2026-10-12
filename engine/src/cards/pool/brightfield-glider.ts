import { defineCard } from "../define.js";
import { ATTACKS_WHILE_SADDLED, saddle, saddleText } from "../helpers.js";

const ATTACK_TEXT = "Whenever this creature attacks while saddled, it gets +1/+2 and gains flying until end of turn.";

export default defineCard({
  name: "Brightfield Glider",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Possum", "Mount"],
  power: 1,
  toughness: 1,
  keywords: ["vigilance"],
  text: `Vigilance\n${ATTACK_TEXT}\n${saddleText(3)}`,
  triggered: [
    {
      ...ATTACKS_WHILE_SADDLED,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 2, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [saddle(3, saddleText(3))],
});
