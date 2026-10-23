import { defineCard } from "../define.js";

// Kaladesh. EDHREC rank 27514. "Sacrifice this creature unless you pay
// {E}{E}" is Liberty Prime, Recharged's shape: a `may` paying the energy
// that does nothing else, its decline (or too little energy) sacrificing
// this creature.
const ENTER_TEXT = "When this creature enters, you get {E}{E} (two energy counters).";
const END_TEXT = "At the beginning of your end step, sacrifice this creature unless you pay {E}{E}.";

export default defineCard({
  name: "Lathnu Hellion",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Hellion"],
  power: 4,
  toughness: 4,
  keywords: ["haste"],
  text: `Haste\n${ENTER_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {E}{E} to keep Lathnu Hellion? (Otherwise it's sacrificed.)",
        costEnergy: 2,
        effect: { kind: "sequence", effects: [] },
        else: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
