import { defineCard } from "../define.js";

// Playtest card (Unknown Event). Syr Acha is a token of its own (tokens/syr-acha.ts).
const ETB_TEXT =
  "When The Value Knight enters the battlefield, create Syr Acha, a 1/1 legendary red artifact creature Food Knight token with \"{2}, {T}, Sacrifice this token: You gain 3 life. Until end of turn, if you would draw a card, draw two cards instead.\"";
const DRAW_TEXT = "Whenever you draw a card, put a +1/+1 counter on The Value Knight.";

export default defineCard({
  name: "The Value Knight",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 1,
  toughness: 1,
  text: `${ETB_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Syr Acha", count: 1 },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "draws", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
