import { defineCard } from "../define.js";

// "This creature and any number of other non-Eldrazi creatures": a cost of two
// parts, the second any number (X, announced as it's activated). It makes a
// token for every creature sacrificed, the Evangel itself among them.
export default defineCard({
  name: "Emrakul's Evangel",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Horror"],
  power: 3,
  toughness: 2,
  text:
    "{T}, Sacrifice this creature and any number of other non-Eldrazi creatures: Create a 3/2 colorless Eldrazi Horror creature token for each creature sacrificed this way.",
  activated: [
    {
      cost: {
        mana: null,
        tap: true,
        sacrifice: {
          parts: [
            { filter: { isSource: true }, count: 1 },
            { filter: { type: "creature", notSubtypes: ["Eldrazi"], isSource: false }, count: "x" },
          ],
        },
      },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Horror Token", count: { sum: ["x", 1] } },
      resolve: null,
      text:
        "{T}, Sacrifice this creature and any number of other non-Eldrazi creatures: Create a 3/2 colorless Eldrazi Horror creature token for each creature sacrificed this way.",
    },
  ],
});
