import { crew } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 11313.
//
// Fecund Greenshell's look: a permanent card may go onto the battlefield;
// whatever doesn't — declined, or not a permanent card — goes to the hand.

const DAMAGE_TEXT =
  "Whenever this Vehicle deals combat damage to a player, look at the top card of your library. If it's a permanent card, you may put it onto the battlefield. If you don't put it onto the battlefield, put it into your hand.";

export default defineCard({
  name: "N'Yami-Class Mother Ship",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 5,
  toughness: 7,
  keywords: ["flying", "vigilance", "haste"],
  text: `Flying, vigilance, haste\n${DAMAGE_TEXT}\nCrew 3`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        min: 0,
        max: 1,
        filter: { typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"] },
        destination: "battlefield",
        leftover: "hand",
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  activated: [crew(3)],
});
