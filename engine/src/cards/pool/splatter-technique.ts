import { defineCard } from "../define.js";

// EDHREC rank 11296. Brotherhood's End's shape.
const DRAW_TEXT = "Draw four cards.";
const DAMAGE_TEXT = "Splatter Technique deals 4 damage to each creature and planeswalker.";

export default defineCard({
  name: "Splatter Technique",
  manaCost: "{1}{U}{U}{R}{R}",
  colors: ["U", "R"],
  types: ["sorcery"],
  text: `Choose one —\n• ${DRAW_TEXT}\n• ${DAMAGE_TEXT}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      { text: DRAW_TEXT, effect: { kind: "draw", amount: 4 } },
      {
        text: DAMAGE_TEXT,
        effect: { kind: "damage-all", amount: 4, filter: { typesAnyOf: ["creature", "planeswalker"] } },
      },
    ],
  },
});
