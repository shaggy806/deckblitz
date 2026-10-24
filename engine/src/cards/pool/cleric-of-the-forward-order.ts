import { defineCard } from "../define.js";

// Magic Origins. EDHREC rank 30471.
//
// Rulings:
//   [2015-06-22] Count the creatures named Cleric of the Forward Order you control as the ability
//     resolves. If the Cleric whose ability triggered is still on the battlefield, it counts itself.
const ETB_TEXT =
  "When this creature enters, you gain 2 life for each creature you control named Cleric of the Forward Order.";

export default defineCard({
  name: "Cleric of the Forward Order",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: ETB_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "gain-life",
        amount: {
          countOf: { type: "creature", controlledBy: "you", name: "Cleric of the Forward Order" },
          times: 2,
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
