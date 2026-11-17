import { defineCard } from "../define.js";

// Darksteel (DST).
//
// "Each creature you control with modular" is `hasKeyword: "modular"`, read off each
// creature's text box: modular is authored as its two parts (Arcbound Worker), so its
// printed line is what marks it — "Modular N" or "Modular—Sunburst" (Arcbound Wanderer),
// and none at all once a creature has lost its abilities. The Overseer has modular too,
// so its own upkeep counter lands on it.

export default defineCard({
  name: "Arcbound Overseer",
  manaCost: "{8}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 0,
  toughness: 0,
  text: "At the beginning of your upkeep, put a +1/+1 counter on each creature you control with modular.\nModular 6 (This creature enters with six +1/+1 counters on it. When it dies, you may put its +1/+1 counters on target artifact creature.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you", hasKeyword: "modular" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: "At the beginning of your upkeep, put a +1/+1 counter on each creature you control with modular.",
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "permanent", filter: { types: ["artifact", "creature"] } }],
      effect: {
        kind: "may",
        prompt: "Put this creature's +1/+1 counters on target artifact creature?",
        effect: {
          kind: "add-counter",
          target: 0,
          counter: "+1/+1",
          amount: { countersOn: "source", counter: "+1/+1" },
        },
      },
      resolve: null,
      text: "Modular 6",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 6 } },
      text: "Modular 6",
    },
  ],
});
