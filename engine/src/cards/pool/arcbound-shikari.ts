import { defineCard } from "../define.js";

// Modular is Arcbound Mouser's shape.

export default defineCard({
  name: "Arcbound Shikari",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  types: ["artifact", "creature"],
  subtypes: ["Cat", "Soldier"],
  power: 0,
  toughness: 0,
  keywords: ["first-strike"],
  text: "First strike\nWhen this creature enters, put a +1/+1 counter on each other artifact creature you control.\nModular 2 (This creature enters with two +1/+1 counters on it. When it dies, you may put its +1/+1 counters on target artifact creature.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { types: ["artifact", "creature"], controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
        exceptSource: true,
      },
      resolve: null,
      text: "When this creature enters, put a +1/+1 counter on each other artifact creature you control.",
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
