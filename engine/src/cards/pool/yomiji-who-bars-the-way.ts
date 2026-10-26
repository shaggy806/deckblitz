import { defineCard } from "../define.js";

// EDHREC rank 19967.
//
// Rulings:
//   [2005-02-01] Yomiji's ability triggers whenever any legendary permanent is put into a
//     graveyard from the battlefield, not just legendary creatures.
//   [2005-02-01] Yomiji's ability triggers even if Yomiji is going to the graveyard at the same
//     time as the other legendary permanent.

const TEXT =
  "Whenever a legendary permanent other than Yomiji is put into a graveyard from the battlefield, return that card to its owner's hand.";

// Tezzeret's Touch's return of the trigger's card, on a leaves-the-battlefield
// trigger that looks back (rule 603.10a), so Yomiji leaving alongside still sees it.
export default defineCard({
  name: "Yomiji, Who Bars the Way",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "leaves-battlefield",
        who: "any",
        filter: { supertype: "legendary" },
        otherOnly: true,
        to: ["graveyard"],
      },
      targets: [],
      effect: { kind: "return-to-hand", target: "trigger-object", from: "graveyard" },
      resolve: null,
      text: TEXT,
    },
  ],
});
