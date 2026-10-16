import { defineCard } from "../define.js";

// EDHREC rank 7408.
//
// Rulings:
//   [2024-07-05] An ability that triggers "whenever you cast a historic spell" doesn't trigger if
//     a historic card is put onto the battlefield without being cast.
//   [2024-07-05] Lands are never cast, so abilities that trigger "whenever you cast a historic
//     spell" won't trigger if you play a legendary land. They also won't trigger if a card on the
//     battlefield transforms into a card with the legendary supertype, the artifact card type, or
//     the Saga subtype.
//   [2024-07-05] A card, spell, or permanent is historic if it has the legendary supertype, the
//     artifact card type, or the Saga subtype. Having two of those qualities doesn't make an
//     object more historic than another or provide an additional bonus—an object either is
//     historic or it isn't.
//   [2024-07-05] Some abilities trigger "whenever you cast a historic spell." Such an ability
//     resolves before the spell that caused it to trigger. It resolves even if that spell is
//     countered.

// Jhoira's historic filter: artifacts, legendaries and Sagas, read on the
// spell as it's cast. It resolves before the spell, even if that's countered.
const CAST_TEXT =
  "Whenever you cast a historic spell, Surtr deals 3 damage to any target. (Artifacts, legendaries, and Sagas are historic.)";

export default defineCard({
  name: "Surtr, Fiery Jötun",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Giant", "God", "Warrior"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample (This creature can deal excess combat damage to the player it's attacking.)\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }] },
      },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
