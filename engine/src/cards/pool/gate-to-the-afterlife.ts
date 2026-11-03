import { defineCard } from "../define.js";
import { searchZonesAndOr } from "../helpers.js";

// "Your graveyard, hand, and/or library": the player's choice of zones as it
// resolves, only a search of the library shuffling.

const DIES = "Whenever a nontoken creature you control dies, you gain 1 life. Then you may draw a card. If you do, discard a card.";
const ACTIVATE =
  "{2}, {T}, Sacrifice this artifact: Search your graveyard, hand, and/or library for a card named God-Pharaoh's Gift and put it onto the battlefield. If you search your library this way, shuffle. Activate only if there are six or more creature cards in your graveyard.";

export default defineCard({
  name: "Gate to the Afterlife",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${DIES}\n${ACTIVATE}`,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { token: false, type: "creature" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 1 },
          {
            kind: "may",
            prompt: "Draw a card, then discard a card?",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "draw", amount: 1 },
                {
                  kind: "conditional",
                  condition: { kind: "this-way", what: "drawn", who: "you" },
                  then: { kind: "discard", target: "you", amount: 1 },
                },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: DIES,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      condition: { kind: "cards-in-graveyard", atLeast: 6, filter: { type: "creature" } },
      targets: [],
      effect: searchZonesAndOr(["graveyard", "hand", "library"], {
        kind: "search-library",
        filter: { name: "God-Pharaoh's Gift" },
        destination: "battlefield",
        min: 0,
        max: 1,
      }),
      resolve: null,
      text: ACTIVATE,
    },
  ],
});
