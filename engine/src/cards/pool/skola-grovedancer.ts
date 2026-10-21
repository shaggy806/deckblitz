import { defineCard } from "../define.js";

export default defineCard({
  name: "Skola Grovedancer",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment", "creature"],
  subtypes: ["Satyr", "Druid"],
  power: 2,
  toughness: 2,
  text: "Whenever a land card is put into your graveyard from anywhere, you gain 1 life.\n{2}{G}: Mill a card. (Put the top card of your library into your graveyard.)",
  triggered: [
    {
      trigger: { on: "put-into-graveyard", who: "you", filter: { type: "land" } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: "Whenever a land card is put into your graveyard from anywhere, you gain 1 life.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 1 },
      resolve: null,
      text: "{2}{G}: Mill a card.",
    },
  ],
});
