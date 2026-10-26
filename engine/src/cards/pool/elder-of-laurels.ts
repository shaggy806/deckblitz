import { defineCard } from "../define.js";

const PUMP_TEXT =
  "{3}{G}: Target creature gets +X/+X until end of turn, where X is the number of creatures you control.";

// X is counted as the ability resolves and is locked in then (the rulings).
export default defineCard({
  name: "Elder of Laurels",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 2,
  toughness: 3,
  text: PUMP_TEXT,
  activated: [
    {
      cost: { mana: "{3}{G}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { countOf: { type: "creature", controlledBy: "you" } },
        toughness: { countOf: { type: "creature", controlledBy: "you" } },
        duration: "end-of-turn",
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
