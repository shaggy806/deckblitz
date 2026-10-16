import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 14491.
//
// The two abilities are the equipped creature's own (Paradise Mantle's
// `grantsActivated`): its {T}, and the discover is its controller's.
const STATIC_TEXT =
  'Equipped creature has reach, "{2}, {T}: Tap target artifact or creature," and "{8}, {T}: Discover 10." (Exile cards from the top of your library until you exile a nonland card with mana value 10 or less. Cast it without paying its mana cost or put it into your hand. Put the rest on the bottom in a random order.)';

export default defineCard({
  name: "Swashbuckler's Whip",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\nEquip {1}`,
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["reach"],
      grantsActivated: [
        {
          cost: { mana: "{2}", tap: true },
          targets: ["artifact-or-creature"],
          effect: { kind: "tap", target: 0 },
          resolve: null,
          text: "{2}, {T}: Tap target artifact or creature.",
        },
        {
          cost: { mana: "{8}", tap: true },
          targets: [],
          effect: { kind: "discover", amount: 10 },
          resolve: null,
          text: "{8}, {T}: Discover 10.",
        },
      ],
      text: STATIC_TEXT,
    },
  ],
  activated: [equip("{1}")],
});
