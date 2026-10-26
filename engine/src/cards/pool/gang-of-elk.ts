import { defineCard } from "../define.js";

// Rulings:
//   Gang of Elk gets the bonus once for each blocker.

const TEXT = "Whenever this creature becomes blocked, it gets +2/+2 until end of turn for each creature blocking it.";

export default defineCard({
  name: "Gang of Elk",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elk", "Beast"],
  power: 5,
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
