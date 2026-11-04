import { defineCard } from "../define.js";

export default defineCard({
  name: "Swift Silence",
  manaCost: "{2}{W}{U}{U}",
  colors: ["W", "U"],
  types: ["instant"],
  text: "Counter all other spells. Draw a card for each spell countered this way.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "for-each-on-stack", spells: true, effect: { kind: "counter", target: 0 } },
      { kind: "draw", amount: { thisWay: "countered" } },
    ],
  },
});
