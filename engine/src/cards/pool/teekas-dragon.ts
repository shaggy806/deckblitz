import { defineCard } from "../define.js";

export default defineCard({
  name: "Teeka's Dragon",
  manaCost: "{9}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "trample"],
  text: "Flying; trample; rampage 4 (Whenever this creature becomes blocked, it gets +4/+4 until end of turn for each creature blocking it beyond the first.)",
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { product: [4, { difference: [{ blockersOf: "source" }, 1] }] },
        toughness: { product: [4, { difference: [{ blockersOf: "source" }, 1] }] },
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Rampage 4 (Whenever this creature becomes blocked, it gets +4/+4 until end of turn for each creature blocking it beyond the first.)",
    },
  ],
});
