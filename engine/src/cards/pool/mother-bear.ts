import { defineCard } from "../define.js";

export default defineCard({
  name: "Mother Bear",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Bear"],
  power: 2,
  toughness: 2,
  text: "{3}{G}{G}, Exile this card from your graveyard: Create two 2/2 green Bear creature tokens. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: "{3}{G}{G}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Bear Token", count: 2 },
      resolve: null,
      text: "{3}{G}{G}, Exile this card from your graveyard: Create two 2/2 green Bear creature tokens. Activate only as a sorcery.",
      zone: "graveyard",
      sorcerySpeed: true,
    },
  ],
});
