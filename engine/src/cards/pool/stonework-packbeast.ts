import { defineCard } from "../define.js";

// EDHREC rank 14673.

export default defineCard({
  name: "Stonework Packbeast",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Beast"],
  power: 2,
  toughness: 1,
  alsoSubtypes: ["Cleric", "Rogue", "Warrior", "Wizard"],
  text: "Stonework Packbeast is also a Cleric, Rogue, Warrior, and Wizard.\n{2}: Add one mana of any color.",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{2}: Add one mana of any color.",
    },
  ],
});
