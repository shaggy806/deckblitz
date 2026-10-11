import { defineCard } from "../define.js";

// Banned in Commander; in the pool for casual play.
//
// Rulings:
//   [2012-05-01] You can't activate Griselbrand's ability if you have 6 or less life.
//
// Paying life is a cost (rule 119.4): payable only with at least 7 life.

const DRAW_TEXT = "Pay 7 life: Draw seven cards.";

export default defineCard({
  name: "Griselbrand",
  manaCost: "{4}{B}{B}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 7,
  toughness: 7,
  keywords: ["flying", "lifelink"],
  text: `Flying, lifelink\n${DRAW_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, payLife: 7 },
      targets: [],
      effect: { kind: "draw", amount: 7 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
