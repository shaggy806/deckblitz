import { defineCard } from "../define.js";

// EDHREC rank 19748.
//
// Rulings:
//   [2019-10-04] If a Knight you control is dealt lethal damage at the same time as Venerable
//     Knight, they die at the same time. That Knight can't receive a counter from Venerable
//     Knight's ability in time to save it.

const TEXT = "When this creature dies, put a +1/+1 counter on target Knight you control.";

export default defineCard({
  name: "Venerable Knight",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Knight" } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
