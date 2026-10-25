import { defineCard } from "../define.js";

// Homelands (HML). EDHREC rank 30794.

const TEXT = "At the beginning of your upkeep, sacrifice this creature unless you pay {G}{G}.";

export default defineCard({
  name: "Hungry Mist",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 6,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{G}{G}", text: "Pay {G}{G}" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
