import { defineCard } from "../define.js";

// EDHREC rank 8296.
//
// Supernatural Stamina's shape: the +2/+0 and a granted triggered ability,
// both until end of turn. The granted trigger is God-Eternal Oketra's "dies
// or is put into exile from the battlefield" (a leaves-the-battlefield trigger
// that looks back, rule 603.10a); "return it to its owner's hand" follows the
// card to whichever of the two zones it went to, so it's a return from the
// graveyard and one from exile — only the one where the card is does anything,
// and a card that has moved on again since is a new object (rule 400.7).

const TEXT =
  'Until end of turn, target creature gets +2/+0 and gains "When this creature dies or is put into exile from the battlefield, return it to its owner\'s hand."';
const GRANTED_TEXT =
  "When this creature dies or is put into exile from the battlefield, return it to its owner's hand.";

export default defineCard({
  name: "Ashnod's Intervention",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: TEXT,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      {
        kind: "grant-triggered",
        target: 0,
        duration: "end-of-turn",
        ability: {
          trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard", "exile"] },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "return-to-hand", target: "trigger-object", from: "graveyard" },
              { kind: "return-to-hand", target: "trigger-object", from: "exile" },
            ],
          },
          resolve: null,
          text: GRANTED_TEXT,
        },
      },
    ],
  },
});
