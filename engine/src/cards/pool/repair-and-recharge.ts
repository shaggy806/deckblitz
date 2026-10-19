import { defineCard } from "../define.js";

// EDHREC rank 16435. The Brothers' War.
// Rulings:
//   Although all the cards in The Brothers' War that create Powerstone tokens create a tapped
//   Powerstone token, entering the battlefield tapped isn't part of the token's definition.

export default defineCard({
  name: "Repair and Recharge",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Return target artifact, enchantment, or planeswalker card from your graveyard to the battlefield. Create a tapped Powerstone token. (It's an artifact with \"{T}: Add {C}. This mana can't be spent to cast a nonartifact spell.\")",
  targets: [
    {
      kind: "card-in-graveyard",
      whose: "you",
      filter: { typesAnyOf: ["artifact", "enchantment", "planeswalker"] },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      { kind: "create-token", token: "Powerstone Token", count: 1, tapped: true },
    ],
  },
});
