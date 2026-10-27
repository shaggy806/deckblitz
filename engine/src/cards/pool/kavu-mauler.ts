import { defineCard } from "../define.js";

// EDHREC rank 29147. Aurochs' shape, +1/+1.

const COUNT = { countOf: { type: "creature", subtype: "Kavu", attacking: true }, excludeSelf: true } as const;

export default defineCard({
  name: "Kavu Mauler",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: "Trample\nWhenever this creature attacks, it gets +1/+1 until end of turn for each other attacking Kavu.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: COUNT, toughness: COUNT, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature attacks, it gets +1/+1 until end of turn for each other attacking Kavu.",
    },
  ],
});
