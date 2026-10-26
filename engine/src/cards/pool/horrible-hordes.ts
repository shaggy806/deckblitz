import { defineCard } from "../define.js";

// EDHREC rank 29447.

export default defineCard({
  name: "Horrible Hordes",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  text: "Rampage 1 (Whenever this creature becomes blocked, it gets +1/+1 until end of turn for each creature blocking it beyond the first.)",
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { product: [1, { difference: [{ blockersOf: "source" }, 1] }] },
        toughness: { product: [1, { difference: [{ blockersOf: "source" }, 1] }] },
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Rampage 1 (Whenever this creature becomes blocked, it gets +1/+1 until end of turn for each creature blocking it beyond the first.)",
    },
  ],
});
