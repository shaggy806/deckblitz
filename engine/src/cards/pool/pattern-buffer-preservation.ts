import { defineCard } from "../define.js";

// EDHREC rank 32664.

export default defineCard({
  name: "Pattern Buffer Preservation",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  flashback: {
    cost: "{1}{B}",
    returnToHand: { filter: { type: "creature" }, count: 1 },
    keyword: "beam-me-up",
  },
  text: "Look at the top two cards of your library. Put one of them into your hand and the other into your graveyard.\nBeam me up {1}{B} (You may cast this card from your graveyard for {1}{B} if you also return a creature you control to its owner's hand. Then exile this spell.)",
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 2,
    min: 1,
    max: 1,
    destination: "hand",
    leftover: "graveyard",
  },
});
