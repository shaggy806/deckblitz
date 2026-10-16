import { defineCard } from "../define.js";

const ENTERS = "When this enchantment enters, put a flying counter on each face-down creature you control.";
const REPLACE = "Face-down creatures you control enter with a flying counter on them.";
const UPKEEP = "At the beginning of your upkeep, you may cloak the top card of your library.";
const FACE_DOWN = { type: "creature", faceDown: true, controlledBy: "you" } as const;

export default defineCard({
  name: "Veiled Ascension",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${ENTERS}\n${REPLACE}\n${UPKEEP}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "add-counter-all", filter: FACE_DOWN, counter: "flying", amount: 1 },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Cloak the top card of your library?",
        effect: { kind: "manifest", who: "you", cloak: true },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "others-enter-battlefield", filter: FACE_DOWN, counters: { kind: "flying", amount: 1 } },
      text: REPLACE,
    },
  ],
});
