import { defineCard } from "../define.js";

// Gating: the creature is chosen on resolution, not targeted (the ruling),
// and the Wurm itself qualifies.
const GATE = "When this creature enters, return a red or green creature you control to its owner's hand.";

export default defineCard({
  name: "Shivan Wurm",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 7,
  toughness: 7,
  keywords: ["trample"],
  text: `Trample\n${GATE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you", anyOf: [{ colors: ["R"] }, { colors: ["G"] }] },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return a red or green creature you control to its owner's hand",
      },
      resolve: null,
      text: GATE,
    },
  ],
});
