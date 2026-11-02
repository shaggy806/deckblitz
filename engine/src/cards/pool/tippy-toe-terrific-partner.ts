import { defineCard } from "../define.js";

const TOKEN_TEXT =
  'If you would create one or more tokens, instead create those tokens plus an additional Food token. (It\'s an artifact with "{2}, {T}, Sacrifice this token: You gain 3 life.")';
const END_TEXT = "At the beginning of your end step, if you gained life this turn, draw a card.";

export default defineCard({
  name: "Tippy-Toe, Terrific Partner",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Squirrel", "Hero"],
  power: 2,
  toughness: 4,
  text: `${TOKEN_TEXT}\n${END_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-create-token", plusOneToken: "Food Token" },
      text: TOKEN_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 1 },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
