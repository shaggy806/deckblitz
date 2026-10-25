import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 14335.

const TEXT = "At the beginning of your upkeep, put a -1/-1 counter on each creature.";

export default defineCard({
  name: "Harbinger of Night",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "add-counter-all", filter: { type: "creature" }, counter: "-1/-1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
