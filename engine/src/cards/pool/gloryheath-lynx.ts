import { defineCard } from "../define.js";
import { ATTACKS_WHILE_SADDLED, saddle, saddleText } from "../helpers.js";

const ATTACK_TEXT =
  "Whenever this creature attacks while saddled, search your library for a basic Plains card, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Gloryheath Lynx",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Mount"],
  power: 2,
  toughness: 3,
  keywords: ["lifelink"],
  text: `Lifelink\n${ATTACK_TEXT}\n${saddleText(2)}`,
  triggered: [
    {
      ...ATTACKS_WHILE_SADDLED,
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", subtype: "Plains" },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [saddle(2, saddleText(2))],
});
