import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 31801.
//
// Any nonartifact creature its controller controls, this one included.

const TEXT =
  "At the beginning of your upkeep, you may sacrifice a nonartifact creature. If you do, put a +1/+1 counter on this creature. If you don't, tap this creature.";

export default defineCard({
  name: "Ravenous Vampire",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [
          { sacrifice: { type: "creature", notTypes: ["artifact"] }, text: "Sacrifice a nonartifact creature" },
        ],
        ifDid: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ifDidnt: { kind: "tap", target: "source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
