import { defineCard } from "../define.js";

export default defineCard({
  name: "Shaleskin Bruiser",
  manaCost: "{6}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: "Trample\nWhenever this creature attacks, it gets +3/+0 until end of turn for each other attacking Beast.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { countOf: { type: "creature", subtype: "Beast", attacking: true }, excludeSelf: true, times: 3 },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Whenever this creature attacks, it gets +3/+0 until end of turn for each other attacking Beast.",
    },
  ],
});
