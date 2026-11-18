import { CHOSEN_THIS_WAY } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 16932.
//
// Every name is in before anything is revealed (the ruling: the active player
// names first, then each other player in turn order) — a `vote` with `choose`
// for a card name, each asked as `choose-card-name`. Then each player reveals
// their own top card: `for-each-vote` hands each player their own name
// (`CHOSEN_THIS_WAY`), and a card with it must go to their hand (`min: 1`
// over a `hasName` filter); anything else — even another player's name — goes
// to the bottom (the ruling). Nothing is asked between the reveals, so taking
// them one player at a time changes nothing.

const TEXT =
  "Whenever this creature attacks, each player chooses a card name. Then each player reveals the top card of their library. If the card a player revealed has the name they chose, that player puts it into their hand. If it doesn't, that player puts it on the bottom of their library.";

export default defineCard({
  name: "Conundrum Sphinx",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "vote", choose: true, for: { cardName: { aim: "own-library" } } },
          {
            kind: "for-each-vote",
            effect: {
              kind: "look-and-choose",
              player: "that-player",
              zone: "library",
              count: 1,
              reveal: true,
              min: 1,
              max: 1,
              filter: { hasName: CHOSEN_THIS_WAY },
              destination: "hand",
              leftover: "bottom-random",
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
