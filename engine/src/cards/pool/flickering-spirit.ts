import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 30866.
//
// Rulings:
//   [2007-02-01] If a token copy of Flickering Spirit uses its activated ability, the token will
//     not return to the battlefield, because of the rule that says tokens that leave the
//     battlefield can't return.

const FLICKER_TEXT = "{3}{W}: Exile this creature, then return it to the battlefield under its owner's control.";

export default defineCard({
  name: "Flickering Spirit",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${FLICKER_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{W}", tap: false },
      targets: [],
      effect: { kind: "flicker", target: "source" },
      resolve: null,
      text: FLICKER_TEXT,
    },
  ],
});
