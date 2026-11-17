import { defineCard } from "../define.js";

// EDHREC rank 13309. Oath of the Gatewatch.
//
// Rulings:
//   No player can look at the cards once they're exiled.
//   If your opponent puts one of the face-down exiled cards into your graveyard (for example,
//     to activate an ability of an Eldrazi Processor), choose one of the cards at random. The
//     card is revealed only after the cost is fully paid.
//
// Devoid: colorless for its black mana cost. Leveler's "exile all cards from
// your library" with `faceDown: true` (Bomat Courier's: nobody may look, its
// owner included), then Paradigm Shift's shuffle. A processor's cost takes a
// face-down card from its group at random (`AbilityCost.putFromExile`).
const ENTER_TEXT =
  "When this creature enters, exile all cards from your library face down, then shuffle all cards from your graveyard into your library.";

export default defineCard({
  name: "Inverter of Truth",
  manaCost: "{2}{B}{B}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Devoid (This card has no color.)\nFlying\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-from-library", whose: "you", allBut: 0, faceDown: true },
          { kind: "shuffle-graveyard-into-library", target: "you" },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
