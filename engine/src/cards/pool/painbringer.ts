import { defineCard } from "../define.js";

// EDHREC rank 30115.
//
// "Exile any number of cards" is the cost's X, chosen as it's activated (zero
// included): that many cards exiled, and X is the number exiled this way.

const ABILITY_TEXT =
  "{T}, Exile any number of cards from your graveyard: Target creature gets -X/-X until end of turn, where X is the number of cards exiled this way.";

export default defineCard({
  name: "Painbringer",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Minion"],
  power: 1,
  toughness: 1,
  text: ABILITY_TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, exileFromGraveyard: { count: "x" } },
      targets: ["creature"],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { product: ["x", -1] },
        toughness: { product: ["x", -1] },
        duration: "end-of-turn",
      },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});
