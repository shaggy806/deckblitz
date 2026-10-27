import { defineCard } from "../define.js";

// Odyssey. EDHREC rank 29296. Gang of Elk's trigger.

const TEXT = "Whenever this creature becomes blocked, it gets +2/+2 until end of turn for each creature blocking it.";

export default defineCard({
  name: "Rabid Elephant",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elephant"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { product: [2, { blockersOf: "source" }] },
        toughness: { product: [2, { blockersOf: "source" }] },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
