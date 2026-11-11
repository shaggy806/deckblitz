import { defineCard } from "../define.js";

// EDHREC rank 5752.
//
// Rulings:
//   [2009-10-01] The exiled card is played using the normal timing rules for an artifact, as well
//     as any other applicable restrictions. If it's a nonland card, you'll have to pay its mana
//     cost. The only thing that's different is you're playing it from the exile zone.
//   [2009-10-01] If you don't play the card before the turn ends, it simply remains exiled.
//   [2009-10-01] When the triggered ability resolves, you must search that player's library (and
//     they must shuffle it) even if there are no artifact cards in it or you choose not to find
//     one.
const TEXT =
  "Whenever Thada Adel deals combat damage to a player, search that player's library for an artifact card and exile it. Then that player shuffles. Until end of turn, you may play that card.";

export default defineCard({
  name: "Thada Adel, Acquisitor",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Merfolk", "Rogue"],
  power: 2,
  toughness: 2,
  keywords: ["islandwalk"],
  text: `Islandwalk (This creature can't be blocked as long as defending player controls an Island.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        whose: "trigger-player",
        filter: { type: "artifact" },
        destination: "exile",
        min: 0,
        max: 1,
        mayPlay: { duration: "end-of-turn", play: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
