import { defineCard } from "../define.js";

// EDHREC rank 15070.

export default defineCard({
  name: "Gorilla Berserkers",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ape", "Berserker"],
  power: 2,
  toughness: 3,
  keywords: ["trample"],
  text: "Trample; rampage 2 (Whenever this creature becomes blocked, it gets +2/+2 until end of turn for each creature blocking it beyond the first.)\nThis creature can't be blocked except by three or more creatures.",
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
  static: [
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "cant-be-blocked", byFewerThan: 3 }],
      text: "This creature can't be blocked except by three or more creatures.",
    },
  ],
});
