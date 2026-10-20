import { defineCard } from "../define.js";

export default defineCard({
  name: "Vault Robber",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf", "Rogue"],
  power: 1,
  toughness: 3,
  text: "{1}, {T}, Exile a creature card from your graveyard: Create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")",
  activated: [
    {
      cost: { mana: "{1}", tap: true, exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: "{1}, {T}, Exile a creature card from your graveyard: Create a Treasure token.",
    },
  ],
});
