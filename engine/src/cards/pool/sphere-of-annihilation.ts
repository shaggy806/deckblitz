import { defineCard } from "../define.js";

const voidCounters = { amount: { countersOn: "source", counter: "void" } } as const;

export default defineCard({
  name: "Sphere of Annihilation",
  manaCost: "{X}{B}",
  colors: ["B"],
  types: ["artifact"],
  text: "This artifact enters with X void counters on it.\nAt the beginning of your upkeep, exile this artifact, all creatures and planeswalkers with mana value less than or equal to the number of void counters on it, and all creature and planeswalker cards in graveyards with mana value less than or equal to the number of void counters on it.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "void", amount: "x" } },
      text: "This artifact enters with X void counters on it.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      // One exile: the counters are read before the artifact goes, the
      // artifact last of the three.
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          {
            kind: "exile-all",
            filter: { typesAnyOf: ["creature", "planeswalker"], manaValue: { op: "lte", n: voidCounters } },
          },
          {
            kind: "exile-graveyard",
            target: "each-player",
            filter: { typesAnyOf: ["creature", "planeswalker"], manaValue: { op: "lte", n: voidCounters } },
          },
          { kind: "exile", target: "source" },
        ],
      },
      resolve: null,
      text: "At the beginning of your upkeep, exile this artifact, all creatures and planeswalkers with mana value less than or equal to the number of void counters on it, and all creature and planeswalker cards in graveyards with mana value less than or equal to the number of void counters on it.",
    },
  ],
});
