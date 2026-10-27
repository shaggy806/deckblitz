import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 28168.
//
// Rulings:
//   [2004-10-04] Does give itself Trample, but does not give itself a +1/+1 counter.
//
// Every Kavu creature, whoever controls it; any Kavu entering, whoever's.

const TRAMPLE = "Kavu creatures have trample.";
const COUNTER = "Whenever another Kavu enters, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Kavu Monarch",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 3,
  toughness: 3,
  text: `${TRAMPLE}\n${COUNTER}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Kavu" } },
      grantKeywords: ["trample"],
      text: TRAMPLE,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { subtype: "Kavu" }, otherOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER,
    },
  ],
});
