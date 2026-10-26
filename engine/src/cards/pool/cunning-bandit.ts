import { defineCard } from "../define.js";

// The Kamigawa ki flip cycle (rule 710): a ki counter for each Spirit or
// Arcane spell, and an intervening-if end-step flip (603.4) the controller
// may decline.

const CAST = "Whenever you cast a Spirit or Arcane spell, you may put a ki counter on this creature.";
const FLIP = "At the beginning of the end step, if there are two or more ki counters on this creature, you may flip it.";

export default defineCard({
  name: "Cunning Bandit",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human",  "Warrior"],
  power: 2,
  toughness: 2,
  text: `${CAST}\n${FLIP}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a ki counter on Cunning Bandit?",
        effect: { kind: "add-counter", target: "source", counter: "ki", amount: 1 },
      },
      resolve: null,
      text: CAST,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "self-counters", counter: "ki", compare: { op: "gte", n: 2 } },
      targets: [],
      effect: { kind: "may", prompt: "Flip Cunning Bandit?", effect: { kind: "flip", target: "source" } },
      resolve: null,
      text: FLIP,
    },
  ],
  faces: ["Cunning Bandit", "Azamuki, Treachery Incarnate"],
  flip: true,
});
