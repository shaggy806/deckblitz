import { defineCard } from "../define.js";

// EDHREC rank 1690.
//
// Ruling: the number of players is checked only as you choose X, so one leaving
// in response changes nothing (`maxX` caps the offer; the spell reads X).
const CAP_TEXT = "X can't be greater than the number of players in the game.";
const REVEAL_TEXT =
  "Reveal cards from the top of your library until you reveal X land cards. Put those land cards onto the battlefield tapped and the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Open the Way",
  manaCost: "{X}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: `${CAP_TEXT}\n${REVEAL_TEXT}`,
  maxX: { countPlayers: "each-player" },
  targets: [],
  effect: {
    kind: "reveal-until-count",
    filter: { type: "land" },
    count: "x",
    put: "battlefield",
    tapped: true,
    rest: "bottom-random",
  },
});
