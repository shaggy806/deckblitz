import { defineCard } from "../define.js";

// EDHREC rank 13387.
// Makes Treasure → use "Treasure Token".
// Hired Hexblade's intervening-if (`manaFrom`), and the Treasures count the mana from\nTreasures the permanent kept from its cast.

const ENTER_TEXT =
  "When this creature enters, if mana from a Treasure was spent to cast it, create a Treasure token for each mana from a Treasure spent to cast it.";

export default defineCard({
  name: "Marut",
  manaCost: "{8}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 7,
  toughness: 7,
  keywords: ["trample"],
  text: `Trample\n${ENTER_TEXT} (It's an artifact with "{T}, Sacrifice this token: Add one mana of any color.")`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { manaFrom: { subtype: "Treasure" } } },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Treasure Token",
        count: { manaSpentOf: "source", from: { subtype: "Treasure" } },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
