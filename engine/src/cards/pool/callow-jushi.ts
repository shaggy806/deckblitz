import { defineCard } from "../define.js";

// The Kamigawa ki flip cycle (rule 710): a ki counter for each Spirit or
// Arcane spell, and an intervening-if end-step flip (603.4) the controller
// may decline.

const CAST = "Whenever you cast a Spirit or Arcane spell, you may put a ki counter on this creature.";
const FLIP = "At the beginning of the end step, if there are two or more ki counters on this creature, you may flip it.";

export default defineCard({
  name: "Callow Jushi",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human",  "Wizard"],
  power: 2,
  toughness: 2,
  text: `${CAST}\n${FLIP}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a ki counter on Callow Jushi?",
        effect: { kind: "add-counter", target: "source", counter: "ki", amount: 1 },
      },
      resolve: null,
      text: CAST,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "self-counters", counter: "ki", compare: { op: "gte", n: 2 } },
      targets: [],
      effect: { kind: "may", prompt: "Flip Callow Jushi?", effect: { kind: "flip", target: "source" } },
      resolve: null,
      text: FLIP,
    },
  ],
  faces: ["Callow Jushi", "Jaraku the Interloper"],
  flip: true,
});
