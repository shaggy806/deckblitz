import { defineCard } from "../define.js";

// Theros Beyond Death. Each combat, anyone's turn; an intervening-if, and the
// bonus stays once given (its rulings).

const TEXT =
  "At the beginning of each combat, if you control a creature with power 4 or greater, this creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Stampede Rider",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Satyr"],
  power: 2,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "any" },
      condition: { kind: "controls", filter: { type: "creature", power: { op: "gte", n: 4 } }, atLeast: 1 },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
