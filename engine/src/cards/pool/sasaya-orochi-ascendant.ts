import { defineCard } from "../define.js";

// EDHREC rank 17489.
//
// Revealing the hand is the cost (`revealHand`, rule 701.20a), always
// payable; the land count is asked as the ability resolves (the ruling), and
// a hand short of seven lands then does nothing. No {T}, so it works the turn
// Sasaya arrives.

const TEXT = "Reveal your hand: If you have seven or more land cards in your hand, flip Sasaya.";

export default defineCard({
  name: "Sasaya, Orochi Ascendant",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Snake", "Monk"],
  power: 2,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, revealHand: true },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "hand-size", atLeast: 7, filter: { type: "land" } },
        then: { kind: "flip", target: "source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Sasaya, Orochi Ascendant", "Sasaya's Essence"],
  flip: true,
});
