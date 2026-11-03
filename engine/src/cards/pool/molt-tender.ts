import { defineCard } from "../define.js";

export default defineCard({
  name: "Molt Tender",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect", "Druid"],
  power: 1,
  toughness: 1,
  text: "{T}: Mill a card. (Put the top card of your library into your graveyard.)\n{T}, Exile a card from your graveyard: Add one mana of any color.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 1 },
      resolve: null,
      text: "{T}: Mill a card.",
    },
    {
      cost: { mana: null, tap: true, exileFromGraveyard: { count: 1 } },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}, Exile a card from your graveyard: Add one mana of any color.",
    },
  ],
});
