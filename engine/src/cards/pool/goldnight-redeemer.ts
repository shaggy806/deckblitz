import { defineCard } from "../define.js";

// EDHREC rank 19085.
//
// Rulings:
//   [2012-05-01] The amount of life you gain is based on the number of other creatures you control
//     when the ability resolves.

export default defineCard({
  name: "Goldnight Redeemer",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, you gain 2 life for each other creature you control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "gain-life",
        amount: { countOf: { type: "creature", controlledBy: "you" }, times: 2, excludeSelf: true },
      },
      resolve: null,
      text: "When this creature enters, you gain 2 life for each other creature you control.",
    },
  ],
});
