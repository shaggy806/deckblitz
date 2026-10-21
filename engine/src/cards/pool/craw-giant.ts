import { defineCard } from "../define.js";

// EDHREC rank 26685.

export default defineCard({
  name: "Craw Giant",
  manaCost: "{3}{G}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 6,
  toughness: 4,
  keywords: ["trample"],
  text: "Trample\nRampage 2 (Whenever this creature becomes blocked, it gets +2/+2 until end of turn for each creature blocking it beyond the first.)",
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { product: [2, { difference: [{ blockersOf: "source" }, 1] }] },
        toughness: { product: [2, { difference: [{ blockersOf: "source" }, 1] }] },
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Rampage 2 (Whenever this creature becomes blocked, it gets +2/+2 until end of turn for each creature blocking it beyond the first.)",
    },
  ],
});
