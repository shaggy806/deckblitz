import { defineCard } from "../define.js";

export default defineCard({
  name: "Ventifact Bottle",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "{X}{1}, {T}: Put X charge counters on this artifact. Activate only as a sorcery.\nAt the beginning of your first main phase, if this artifact has a charge counter on it, tap it and remove all charge counters from it. Add {C} for each charge counter removed this way.",
  activated: [
    {
      cost: { mana: "{X}{1}", tap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: "x" },
      resolve: null,
      text: "{X}{1}, {T}: Put X charge counters on this artifact. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      condition: { kind: "self-counters", counter: "charge", compare: { op: "gte", n: 1 } },
      targets: [],
      // The mana is read off the counters just before they come off: the
      // same number as "for each charge counter removed this way".
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: "source" },
          { kind: "add-mana", mana: "C", amount: { countersOn: "source", counter: "charge" } },
          { kind: "remove-counter", target: "source", counter: "charge", amount: { countersOn: "source", counter: "charge" } },
        ],
      },
      resolve: null,
      text: "At the beginning of your first main phase, if this artifact has a charge counter on it, tap it and remove all charge counters from it. Add {C} for each charge counter removed this way.",
    },
  ],
});
