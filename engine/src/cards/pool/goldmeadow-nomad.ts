import { defineCard } from "../define.js";

export default defineCard({
  name: "Goldmeadow Nomad",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Scout"],
  power: 1,
  toughness: 2,
  text: "{W}, Exile this card from your graveyard: Create a 1/1 green and white Kithkin creature token. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Kithkin Token", count: 1 },
      resolve: null,
      text: "{W}, Exile this card from your graveyard: Create a 1/1 green and white Kithkin creature token. Activate only as a sorcery.",
      zone: "graveyard",
      sorcerySpeed: true,
    },
  ],
});
