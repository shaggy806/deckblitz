import { defineCard } from "../define.js";

const DRAW_TEXT = "Whenever a player casts their first multicolored spell each turn, each other player draws a card.";

export default defineCard({
  name: "Zenith Chronicler",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Construct"],
  power: 3,
  toughness: 1,
  text: DRAW_TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", firstTimeEachTurn: true, filter: { multicolored: true } },
      targets: [],
      effect: { kind: "draw", amount: 1, who: "opponents-of-trigger-controller" },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
