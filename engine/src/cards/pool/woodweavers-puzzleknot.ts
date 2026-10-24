import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 20586.
const ENTERS = "When this artifact enters, you gain 3 life and get {E}{E}{E} (three energy counters).";
const SAC = "{2}{G}, Sacrifice this artifact: You gain 3 life and get {E}{E}{E}.";

export default defineCard({
  name: "Woodweaver's Puzzleknot",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${ENTERS}\n${SAC}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 3 },
          { kind: "get-energy", amount: 3 },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 3 },
          { kind: "get-energy", amount: 3 },
        ],
      },
      resolve: null,
      text: SAC,
    },
  ],
});
