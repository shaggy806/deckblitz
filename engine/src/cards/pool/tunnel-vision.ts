import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 14407. Found, everything above the named card goes to the
// graveyard and the library isn't shuffled, so the named card is left on top;
// not found, nothing goes to the graveyard and the library is shuffled (the
// ruling).
export default defineCard({
  name: "Tunnel Vision",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Choose a card name. Target player reveals cards from the top of their library until a card with that name is revealed. If it is, that player puts the rest of the revealed cards into their graveyard and puts the card with the chosen name on top of their library. Otherwise, the player shuffles.",
  targets: ["player"],
  effect: {
    kind: "choose-card-name",
    then: {
      kind: "reveal-until",
      whose: 0,
      filter: { hasName: CHOSEN_CARD_NAME },
      rest: "graveyard",
      keepFound: true,
      ifNone: "shuffle",
    },
  },
});
