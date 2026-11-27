import { defineCard } from "../define.js";

// EDHREC rank 26653.
//
// Rulings:
//   If the player has no nonland cards in their hand, you can still search
//     that player's library and have them shuffle it.
//   The cards you're searching for must be found and exiled if they're in the
//     graveyard because it's a public zone. Finding those cards in the hand and
//     library is optional, because those zones are hidden.
//
// Lobotomy's shape on a combat-damage trigger: the chosen card stays in the
// hand (`destination: "stay"`) for the search (`all`) to find or leave.

const TRIGGER_TEXT =
  "Whenever this creature deals combat damage to a player, that player reveals their hand. You choose a nonland card from it. Search that player's graveyard, hand, and library for all cards with the same name as that card and exile them. Then that player shuffles.";

export default defineCard({
  name: "Shimian Specter",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Specter"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard-chosen", target: "trigger-player", filter: { notTypes: ["land"] }, destination: "stay" },
          {
            kind: "search-library",
            whose: "trigger-player",
            zones: "graveyard-hand-library",
            filter: { sameNameWith: { thisWay: "chosen" } },
            destination: "exile",
            all: true,
            min: 0,
            max: 99,
          },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
