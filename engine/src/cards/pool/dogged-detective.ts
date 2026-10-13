import { defineCard } from "../define.js";

// EDHREC rank 7146.
//
// The return works only from the graveyard (`fromGraveyard`, rule 113.6k —
// Adéwalé's shape); the card needn't have been there for the opponent's
// first draw, only for the second (the ruling).

const RETURN_TEXT =
  "Whenever an opponent draws their second card each turn, you may return this card from your graveyard to your hand.";

export default defineCard({
  name: "Dogged Detective",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 1,
  text: `When this creature enters, surveil 2. (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)\n${RETURN_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 2 },
      resolve: null,
      text: "When this creature enters, surveil 2.",
    },
    {
      fromGraveyard: true,
      trigger: { on: "draws", who: "opponent", nthEachTurn: 2 },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Dogged Detective from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
