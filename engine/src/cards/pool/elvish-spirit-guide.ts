import { defineCard } from "../define.js";

// Rulings:
//   [2022-12-08] If a spell or ability's cost includes returning a creature to your hand and paying
//     mana, you can't activate Elvish Spirit Guide's mana ability after returning it to your hand.
//     This is because mana abilities must be activated before you begin paying costs.
export default defineCard({
  name: "Elvish Spirit Guide",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Spirit"],
  power: 2,
  toughness: 2,
  text: "Exile this card from your hand: Add {G}.",
  activated: [
    {
      cost: { mana: null, tap: false },
      zone: "hand",
      exilesFromHand: true,
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 1 },
      resolve: null,
      text: "Exile this card from your hand: Add {G}.",
    },
  ],
});
