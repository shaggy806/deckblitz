import { defineCard } from "../define.js";

export default defineCard({
  name: "Eternal Student",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Warlock"],
  power: 4,
  toughness: 2,
  text: "{1}{B}, Exile this card from your graveyard: Create two 1/1 white and black Inkling creature tokens with flying.",
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Inkling Token (Emeritus of Truce)", count: 2 },
      resolve: null,
      text: "{1}{B}, Exile this card from your graveyard: Create two 1/1 white and black Inkling creature tokens with flying.",
      zone: "graveyard",
    },
  ],
});
