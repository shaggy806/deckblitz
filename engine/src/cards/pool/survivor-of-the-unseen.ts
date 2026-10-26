import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// Coldsnap (CSP). EDHREC rank 26184.
//
// Rulings:
//   [2006-07-15] If you don't draw a card because all the draws were replaced (with dredge, for
//     example), you still have to put a card from your hand on top of your library.

const TAP_TEXT = "{T}: Draw two cards, then put a card from your hand on top of your library.";

export default defineCard({
  name: "Survivor of the Unseen",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 1,
  text: `Cumulative upkeep {2} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)\n${TAP_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "look-and-choose", zone: "hand", min: 1, max: 1, destination: "library-top", leftover: "stay" },
        ],
      },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
  triggered: [cumulativeUpkeep("{2}")],
});
