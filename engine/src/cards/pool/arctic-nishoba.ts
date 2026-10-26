import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// EDHREC rank 30319. Coldsnap.
//
// "Cumulative upkeep {G} or {W}": each age counter's payment may be either
// colour, which is exactly one hybrid {G/W} per counter. The dies trigger
// reads the age counters through last-known information.

export default defineCard({
  name: "Arctic Nishoba",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat", "Warrior"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: "Trample\nCumulative upkeep {G} or {W} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)\nWhen this creature dies, you gain 2 life for each age counter on it.",
  triggered: [
    {
      ...cumulativeUpkeep("{G/W}"),
      text: "Cumulative upkeep {G} or {W} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)",
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { product: [2, { countersOn: "source", counter: "age" }] } },
      resolve: null,
      text: "When this creature dies, you gain 2 life for each age counter on it.",
    },
  ],
});
