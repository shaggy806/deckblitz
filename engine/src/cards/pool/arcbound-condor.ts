import { defineCard } from "../define.js";

export default defineCard({
  name: "Arcbound Condor",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Bird"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: "Flying\nModular 3 (This creature enters with three +1/+1 counters on it. When it dies, you may put its +1/+1 counters on target artifact creature.)\nWhenever another artifact you control enters, target creature an opponent controls gets -1/-1 until end of turn.",
  triggered: [
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
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "artifact" },
        otherOnly: true,
      },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever another artifact you control enters, target creature an opponent controls gets -1/-1 until end of turn.",
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
