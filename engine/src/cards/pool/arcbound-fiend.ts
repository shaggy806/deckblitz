import { defineCard } from "../define.js";

// EDHREC rank 13270. The target needn't have a counter: with none, nothing
// moves (the ruling).

export default defineCard({
  name: "Arcbound Fiend",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Horror"],
  power: 0,
  toughness: 0,
  keywords: ["fear"],
  text: "Fear (This creature can't be blocked except by artifact creatures and/or black creatures.)\nAt the beginning of your upkeep, you may move a +1/+1 counter from target creature onto this creature.\nModular 3 (This creature enters with three +1/+1 counters on it. When it dies, you may put its +1/+1 counters on target artifact creature.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Move a +1/+1 counter from target creature onto Arcbound Fiend?",
        effect: { kind: "move-counters", from: 0, to: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: "At the beginning of your upkeep, you may move a +1/+1 counter from target creature onto this creature.",
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
      text: "Modular 3",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 3 } },
      text: "Modular 3",
    },
  ],
});
