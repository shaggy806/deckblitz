import { defineCard } from "../define.js";

// EDHREC rank 16487. X counts every attacking creature you control as the
// ability resolves — this one included (the rulings).
const TEXT =
  "Whenever this creature attacks, it gets +X/+0 until end of turn, where X is the number of attacking creatures you control.";

export default defineCard({
  name: "Akroan Hoplite",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { countOf: { type: "creature", attacking: true, controlledBy: "you" } },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
