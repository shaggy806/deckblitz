import { defineCard } from "../define.js";

export default defineCard({
  name: "Buried Treasure",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Treasure"],
  text: "{T}, Sacrifice this artifact: Add one mana of any color.\n{5}, Exile this card from your graveyard: Discover 5. Activate only as a sorcery. (Exile cards from the top of your library until you exile a nonland card with mana value 5 or less. Cast it without paying its mana cost or put it into your hand. Put the rest on the bottom in a random order.)",
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}, Sacrifice this artifact: Add one mana of any color.",
    },
    {
      cost: { mana: "{5}", tap: false },
      targets: [],
      effect: { kind: "discover", amount: 5 },
      resolve: null,
      text: "{5}, Exile this card from your graveyard: Discover 5. Activate only as a sorcery.",
      zone: "graveyard",
      sorcerySpeed: true,
    },
  ],
});
