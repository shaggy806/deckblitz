import { defineCard } from "../define.js";

const ENTERS =
  "When this enchantment enters, choose four nonenchantment permanents you don't control and put an aim counter on each of them.";
const END =
  "At the beginning of your end step, if two or more permanents you don't control have an aim counter on them, destroy one of those permanents at random.";

// Not targeted (a hexproof permanent can get a counter); every aim counter
// counts, whoever put it there; and the random pick is among those without
// indestructible (the rulings).
const AIMED = { not: { controlledBy: "you" }, counters: { kind: "aim", compare: { op: "gte", n: 1 } } } as const;

export default defineCard({
  name: "Haphazard Bombardment",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${ENTERS}\n${END}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { notTypes: ["enchantment"], not: { controlledBy: "you" } },
        min: 4,
        upTo: 4,
        then: { kind: "add-counter", target: 0, counter: "aim", amount: 1 },
        prompt: "Choose four nonenchantment permanents you don't control to get an aim counter",
      },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "opponents-control-total", filter: { counters: AIMED.counters }, atLeast: 2 },
      targets: [],
      effect: {
        kind: "choose-permanents",
        random: true,
        filter: AIMED,
        upTo: 1,
        prompt: "A permanent you don't control with an aim counter, at random",
        then: { kind: "destroy", target: 0 },
      },
      resolve: null,
      text: END,
    },
  ],
});
