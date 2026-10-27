import { defineCard } from "../define.js";

// EDHREC rank 19729.

export default defineCard({
  name: "Cosmic Larva",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 7,
  toughness: 6,
  keywords: ["trample"],
  text: "Trample\nAt the beginning of your upkeep, sacrifice this creature unless you sacrifice two lands.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ sacrifice: { type: "land" }, count: 2, text: "Sacrifice two lands" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: "At the beginning of your upkeep, sacrifice this creature unless you sacrifice two lands.",
    },
  ],
});
