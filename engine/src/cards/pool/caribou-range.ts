import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 28001.
//
// Rulings:
//   [2007-10-01] You can only sacrifice a Caribou token to this, not any creature with the type
//     Caribou.

const GRANT_TEXT = 'Enchanted land has "{W}{W}, {T}: Create a 0/1 white Caribou creature token."';
const SAC_TEXT = "Sacrifice a Caribou token: You gain 1 life.";

export default defineCard({
  name: "Caribou Range",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land you control\n${GRANT_TEXT}\n${SAC_TEXT}`,
  targets: ["land-you-control"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: "{W}{W}", tap: true },
          targets: [],
          effect: { kind: "create-token", token: "Caribou Token", count: 1 },
          resolve: null,
          text: "{W}{W}, {T}: Create a 0/1 white Caribou creature token.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Caribou", token: true } } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
