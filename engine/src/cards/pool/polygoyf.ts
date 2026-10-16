import { defineCard } from "../define.js";
import { myriad } from "../helpers.js";

// EDHREC rank 7542. Modern Horizons 3.
//
// Rulings:
//   [2024-06-07] Polygoyf's power and toughness count card types, not cards, among cards in all
//     graveyards, and work in all zones.
//   [2024-06-07] Each myriad token copies exactly what was printed on Polygoyf (so has its
//     characteristic-defining ability); the tokens were never declared as attackers, so their own
//     myriad doesn't trigger.
//
// Tarmogoyf's characteristic-defining ability (Pyrogoyf's shape), with
// trample and the `myriad` helper's trigger.
const MYRIAD_TEXT =
  "Trample, myriad (Whenever this creature attacks, for each opponent other than defending player, you may create a token copy that's tapped and attacking that player or a planeswalker they control. Exile the tokens at end of combat.)";
const CDA =
  "Polygoyf's power is equal to the number of card types among cards in all graveyards and its toughness is equal to that number plus 1.";

export default defineCard({
  name: "Polygoyf",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Lhurgoyf"],
  power: 0,
  toughness: 1,
  keywords: ["trample"],
  text: `${MYRIAD_TEXT}\n${CDA}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { cardTypesInGraveyard: {} }, plusPower: 0, plusToughness: 1 },
      text: CDA,
    },
  ],
  triggered: [myriad()],
});
