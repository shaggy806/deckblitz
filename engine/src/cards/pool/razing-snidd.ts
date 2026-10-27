import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 32119.
//
// Rulings:
//   [2004-10-04] It probably won't matter much, but you choose the order in which the two
//     triggered abilities are placed on the stack.
//   [2004-10-04] You choose the creature to return on resolution of the triggered ability. This is
//     not targeted.

const GATE = "When this creature enters, return a black or red creature you control to its owner's hand.";
const SAC = "When this creature enters, each player sacrifices a land of their choice.";

export default defineCard({
  name: "Razing Snidd",
  manaCost: "{4}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 3,
  text: `${GATE}\n${SAC}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you", anyOf: [{ colors: ["B"] }, { colors: ["R"] }] },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return a black or red creature you control to its owner's hand",
      },
      resolve: null,
      text: GATE,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "each-player", filter: { type: "land" }, count: 1 },
      resolve: null,
      text: SAC,
    },
  ],
});
