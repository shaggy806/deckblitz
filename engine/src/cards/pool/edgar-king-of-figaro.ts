import { defineCard } from "../define.js";

const DRAW_TEXT = "When Edgar enters, draw a card for each artifact you control.";
const COIN_TEXT =
  "Two-Headed Coin — The first time you flip one or more coins each turn, those coins come up heads and you win those flips.";

export default defineCard({
  name: "Edgar, King of Figaro",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer", "Noble"],
  power: 4,
  toughness: 5,
  text: `${DRAW_TEXT}\n${COIN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-flip-coin", who: "you", comesUp: "heads", wins: true, firstEachTurn: true },
      text: COIN_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: { countOf: { type: "artifact", controlledBy: "you" } } },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
