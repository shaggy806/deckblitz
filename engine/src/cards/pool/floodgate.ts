import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 18540.
//
// Rulings:
//   Floodgate's first triggered ability is a state trigger. It won't trigger again while the
//   ability is on the stack, but if the ability is countered and Floodgate still has flying, it
//   will trigger again immediately.

const SAC_TEXT = "When this creature has flying, sacrifice it.";
const LEAVES_TEXT =
  "When this creature leaves the battlefield, it deals damage to each nonblue creature without flying equal to half the number of Islands you control, rounded down.";

export default defineCard({
  name: "Floodgate",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 5,
  keywords: ["defender"],
  text: `Defender\n${SAC_TEXT}\n${LEAVES_TEXT}`,
  triggered: [
    {
      trigger: { on: "state", state: { kind: "source", filter: { keyword: "flying" } } },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: SAC_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "damage-all",
        filter: { type: "creature", notColors: ["U"], notKeyword: "flying" },
        amount: { half: { countOf: { subtype: "Island", controlledBy: "you" } }, round: "down" },
      },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
});
