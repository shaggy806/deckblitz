import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 31618.

const TEXT = "At the beginning of your upkeep, sacrifice this creature unless you pay {G}{G}.";

export default defineCard({
  name: "Darba",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Bird", "Beast"],
  power: 5,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "unless", chooser: "you", options: [{ pay: "{G}{G}", text: "Pay {G}{G}" }], otherwise: { kind: "sacrifice-source" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
