import { defineCard } from "../define.js";

// EDHREC rank 16553. Dominaria.
//
// Rulings:
//   [2018-04-27] An ability that triggers "whenever you cast a historic spell" doesn't trigger if
//     a historic card is put onto the battlefield without being cast.
//   [2018-04-27] Such an ability resolves before the spell that caused it to trigger. It resolves
//     even if that spell is countered.

const TEXT =
  "Whenever you cast a historic spell, this creature deals 2 damage to each opponent. (Artifacts, legendaries, and Sagas are historic.)";

export default defineCard({
  name: "Cabal Paladin",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 4,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }] },
      },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "each-opponent" },
      resolve: null,
      text: TEXT,
    },
  ],
});
