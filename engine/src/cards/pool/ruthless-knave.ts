import { defineCard } from "../define.js";

// EDHREC rank 9327.
// Makes Treasure → use "Treasure Token".
//
// Rulings:
//   [2017-09-29] You can sacrifice Ruthless Knave to pay the cost for its first ability.
//   [2017-09-29] The Treasures you sacrifice to activate Ruthless Knave's last ability can't also
//     be sacrificed for mana.

const TREASURE_TEXT = "{2}{B}, Sacrifice a creature: Create two Treasure tokens.";
const DRAW_TEXT = "Sacrifice three Treasures: Draw a card.";

export default defineCard({
  name: "Ruthless Knave",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Orc", "Pirate"],
  power: 3,
  toughness: 2,
  text: "{2}{B}, Sacrifice a creature: Create two Treasure tokens. (They're artifacts with \"{T}, Sacrifice this token: Add one mana of any color.\")\nSacrifice three Treasures: Draw a card.",
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 2 },
      resolve: null,
      text: TREASURE_TEXT,
    },
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Treasure" }, count: 3 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
