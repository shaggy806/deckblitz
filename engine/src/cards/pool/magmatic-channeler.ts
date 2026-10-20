import { defineCard } from "../define.js";

// EDHREC rank 14498. Zendikar Rising.
//
// The impulse is Chandra, Flameshaper's `choose: 1`: both cards are exiled,
// one is chosen as it resolves, and only that one may be played this turn —
// the other stays exiled either way (the rulings).

const BONUS_TEXT =
  "As long as there are four or more instant and/or sorcery cards in your graveyard, this creature gets +3/+1.";
const IMPULSE_TEXT =
  "{T}, Discard a card: Exile the top two cards of your library, then choose one of them. You may play that card this turn.";

export default defineCard({
  name: "Magmatic Channeler",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 3,
  text: `${BONUS_TEXT}\n${IMPULSE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cards-in-graveyard", atLeast: 4, filter: { typesAnyOf: ["instant", "sorcery"] } },
      grantPt: [3, 1],
      text: BONUS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, discard: { count: 1 } },
      targets: [],
      effect: { kind: "impulse-exile", amount: 2, duration: "end-of-turn", choose: 1 },
      resolve: null,
      text: IMPULSE_TEXT,
    },
  ],
});
