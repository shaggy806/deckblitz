import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of your end step, if a face-down creature entered the battlefield under your control this turn, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Tunnel Tipster",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Mole", "Scout"],
  power: 1,
  toughness: 1,
  text: `${TEXT}\n{T}: Add {G}.`,
  triggered: [
    {
      // The turn's `entered` list reads each permanent as it entered, so one
      // that has turned face up or left since still counts, and one that
      // entered face up and was turned face down later doesn't (the ruling).
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-history", what: "entered", filter: { type: "creature", faceDown: true } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 1 },
      resolve: null,
      text: "{T}: Add {G}.",
    },
  ],
});
