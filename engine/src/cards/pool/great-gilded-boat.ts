import { crew } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 17187.
//
// Rulings:
//   [2026-06-29] Attacking with any creatures will cause Great Gilded Boat's ability to trigger.
//     Great Gilded Boat doesn't have to be among them.
//   [2026-06-29] Once a spell or ability that causes you to recruit begins to resolve, no player
//     may take any other actions until it's done. Any responses made to the spell or ability must
//     be made before you draw, discard, and potentially create a token.
//
// "Whenever you attack" is Bard, Heir of Girion's `attack-with`; recruit is
// The Queen of Dale's draw, discard, then a token if the card discarded was
// nonland.

const TEXT = "Whenever you attack, recruit.";

export default defineCard({
  name: "Great Gilded Boat",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 4,
  text: `${TEXT} (Draw a card, then discard a card. If you discarded a nonland card, create a 1/1 white Human Soldier creature token.)\nCrew 2 (Tap any number of creatures you control with total power 2 or more: This Vehicle becomes an artifact creature until end of turn.)`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "discarded", filter: { notTypes: ["land"] } },
            then: { kind: "create-token", token: "Human Soldier Token", count: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  activated: [crew(2)],
});
