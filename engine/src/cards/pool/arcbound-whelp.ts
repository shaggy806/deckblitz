import { defineCard } from "../define.js";

export default defineCard({
  name: "Arcbound Whelp",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Dragon"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: "Flying\n{R}: This creature gets +1/+0 until end of turn.\nModular 2 (This creature enters with two +1/+1 counters on it. When it dies, you may put its +1/+1 counters on target artifact creature.)",
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{R}: This creature gets +1/+0 until end of turn.",
    },
  ],
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
      text: "Modular 2",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 2 } },
      text: "Modular 2",
    },
  ],
});
