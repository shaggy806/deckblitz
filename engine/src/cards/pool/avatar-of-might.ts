import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 19671.
//
// Rulings:
//   [2004-10-04] The mana value of this card is still 8, even if you only pay
//   {G}{G} to cast it.

export default defineCard({
  name: "Avatar of Might",
  manaCost: "{6}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 8,
  toughness: 8,
  keywords: ["trample"],
  text: "If an opponent controls at least four more creatures than you, this spell costs {6} less to cast.\nTrample (This creature can deal excess combat damage to the player or planeswalker it's attacking.)",
  // "An opponent" — some one opponent, each compared with you on their own
  // (`opponent-controls-more`'s `by`); the spell in hand isn't one of yours.
  selfCostReduction: {
    condition: { kind: "opponent-controls-more", filter: { type: "creature" }, by: 4 },
    reduceGeneric: 6,
  },
});
