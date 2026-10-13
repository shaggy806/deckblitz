import { defineCard } from "../define.js";

// EDHREC rank 6944.
// Makes Treasure → use "Treasure Token".

export default defineCard({
  name: "Skullport Merchant",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Dwarf", "Citizen"],
  power: 1,
  toughness: 4,
  text: "When this creature enters, create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")\n{1}{B}, Sacrifice another creature or a Treasure: Draw a card.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a Treasure token.",
    },
  ],
  activated: [
    {
      // "Another" reads on the creature: Skullport Merchant is no Treasure.
      cost: {
        mana: "{1}{B}",
        tap: false,
        sacrifice: { filter: { anyOf: [{ type: "creature" }, { subtype: "Treasure" }] } },
      },
      otherOnly: true,
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{1}{B}, Sacrifice another creature or a Treasure: Draw a card.",
    },
  ],
});
