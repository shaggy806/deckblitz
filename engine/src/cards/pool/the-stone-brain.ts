import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// "Up to four cards with that name": none has to be found. The draw counts the
// finds from the hand alone (`exiled-from-hand`), after the shuffle.

const ACTIVATE =
  "{2}, {T}, Exile The Stone Brain: Choose a card name. Search target opponent's graveyard, hand, and library for up to four cards with that name and exile them. That player shuffles, then draws a card for each card exiled from their hand this way. Activate only as a sorcery.";

export default defineCard({
  name: "The Stone Brain",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  supertypes: ["legendary"],
  text: ACTIVATE,
  activated: [
    {
      cost: { mana: "{2}", tap: true, do: { kind: "exile", target: "source" } },
      targets: ["opponent"],
      effect: {
        kind: "choose-card-name",
        then: {
          kind: "search-library",
          whose: { target: 0 },
          zones: "graveyard-hand-library",
          filter: { hasName: CHOSEN_CARD_NAME },
          destination: "exile",
          min: 0,
          max: 4,
          then: { kind: "draw", who: "that-player", amount: { thisWay: "exiled-from-hand" } },
        },
      },
      sorcerySpeed: true,
      resolve: null,
      text: ACTIVATE,
    },
  ],
});
