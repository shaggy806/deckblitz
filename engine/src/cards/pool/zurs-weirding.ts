import { defineCard } from "../define.js";

// Ice Age. EDHREC rank 12293.
//
// The draw becomes an effect (rule 614.1a, Underrealm Lich's shape) with the
// drawing player as `"trigger-player"`: they reveal their library's top card
// (`reveal-top`, the card target 0 of what follows), then every other player,
// in turn order from the active player, is asked in turn whether to pay 2 life
// until one does (rule 101.4, Ice Cave's `unless` over a scope). Paid: the card
// goes from the library straight to the graveyard, never drawn (the ruling).
// Nobody pays: the player draws, a new draw this replacement doesn't replace
// again (rule 614.5) but dredge may (the ruling). Several cards drawn are
// replaced one at a time (614.11a). From an empty library nothing is revealed,
// and the draw that follows a decline is from the empty library (614.11).

const REVEALED = "Players play with their hands revealed.";
const DRAW =
  "If a player would draw a card, they reveal it instead. Then any other player may pay 2 life. If a player does, put that card into its owner's graveyard. Otherwise, that player draws a card.";

export default defineCard({
  name: "Zur's Weirding",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${REVEALED}\n${DRAW}`,
  static: [
    { affects: { scope: "self" }, visibility: { handsRevealed: "each-player" }, text: REVEALED },
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-draw",
        who: "any-player",
        instead: {
          effect: {
            kind: "reveal-top",
            of: "trigger-player",
            then: {
              kind: "unless",
              chooser: { anyOf: { otherThan: "trigger-player" } },
              options: [{ payLife: 2, text: "Pay 2 life", ifPaid: { kind: "put-into-graveyard", target: 0 } }],
              otherwise: { kind: "draw", amount: 1, who: "trigger-player" },
            },
          },
        },
      },
      text: DRAW,
    },
  ],
});
