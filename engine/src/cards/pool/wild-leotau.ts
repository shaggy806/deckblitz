import { defineCard } from "../define.js";

const TEXT = "At the beginning of your upkeep, sacrifice this creature unless you pay {G}.";

export default defineCard({
  name: "Wild Leotau",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 5,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "unless", chooser: "you", options: [{ pay: "{G}", text: "Pay {G}" }], otherwise: { kind: "sacrifice-source" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
