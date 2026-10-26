import { defineCard } from "../define.js";

// The Kamigawa ki flip cycle (rule 710): a ki counter for each Spirit or
// Arcane spell, and an intervening-if end-step flip (603.4) the controller
// may decline.

const CAST = "Whenever you cast a Spirit or Arcane spell, you may put a ki counter on this creature.";
const FLIP = "At the beginning of the end step, if there are two or more ki counters on this creature, you may flip it.";

export default defineCard({
  name: "Budoka Pupil",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human",  "Monk"],
  power: 2,
  toughness: 2,
  text: `${CAST}\n${FLIP}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a ki counter on Budoka Pupil?",
        effect: { kind: "add-counter", target: "source", counter: "ki", amount: 1 },
      },
      resolve: null,
      text: CAST,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "self-counters", counter: "ki", compare: { op: "gte", n: 2 } },
      targets: [],
      effect: { kind: "may", prompt: "Flip Budoka Pupil?", effect: { kind: "flip", target: "source" } },
      resolve: null,
      text: FLIP,
    },
  ],
  faces: ["Budoka Pupil", "Ichiga, Who Topples Oaks"],
  flip: true,
});
