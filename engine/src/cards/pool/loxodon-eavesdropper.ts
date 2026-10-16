import { defineCard } from "../define.js";
import { investigate } from "../helpers.js";

const DRAW_TEXT =
  "Whenever you draw your second card each turn, this creature gets +1/+1 and gains vigilance until end of turn.";

export default defineCard({
  name: "Loxodon Eavesdropper",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elephant", "Detective"],
  power: 3,
  toughness: 3,
  text: `When this creature enters, investigate. (Create a Clue token. It's an artifact with "{2}, Sacrifice this token: Draw a card.")\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: investigate(),
      resolve: null,
      text: "When this creature enters, investigate.",
    },
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "vigilance", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
