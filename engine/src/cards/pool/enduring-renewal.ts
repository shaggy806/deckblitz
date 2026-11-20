import { defineCard } from "../define.js";

// Ice Age. EDHREC rank 17538.
//
// The draw becomes an effect (rule 614.1a): reveal the library's top card
// (`reveal-top`, the card target 0 of `then`); a creature card goes from the
// library to the graveyard, never drawn; anything else is drawn, a new draw
// this replacement doesn't replace again (rule 614.5). From an empty library
// nothing is revealed and the draw is from the empty library (614.11). The
// trigger is Mortuary's: a creature card of yours that died, as it now is in
// the graveyard (rule 400.7).

const REVEALED = "Play with your hand revealed.";
const DRAW =
  "If you would draw a card, reveal the top card of your library instead. If it's a creature card, put it into your graveyard. Otherwise, draw a card.";
const RETURN = "Whenever a creature is put into your graveyard from the battlefield, return it to your hand.";

export default defineCard({
  name: "Enduring Renewal",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${REVEALED}\n${DRAW}\n${RETURN}`,
  static: [
    { affects: { scope: "self" }, visibility: { handsRevealed: "you" }, text: REVEALED },
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-draw",
        who: "you",
        instead: {
          effect: {
            kind: "reveal-top",
            then: {
              kind: "conditional",
              condition: { kind: "target", index: 0, filter: { type: "creature" } },
              then: { kind: "put-into-graveyard", target: 0 },
              else: { kind: "draw", amount: 1 },
            },
          },
        },
      },
      text: DRAW,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", ownedBy: "you" } },
      targets: [],
      effect: { kind: "return-to-hand", target: "trigger-object", from: "graveyard" },
      resolve: null,
      text: RETURN,
    },
  ],
});
