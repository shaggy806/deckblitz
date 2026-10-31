import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 29344. Martyr of Sands' "Reveal X [colour]
// cards from your hand" cost (`reveal`); Earthquake's damage to each
// creature without flying, X of it.

const TEXT =
  "{2}, Reveal X red cards from your hand, Sacrifice this creature: This creature deals X damage to each creature without flying.";

export default defineCard({
  name: "Martyr of Ashes",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: "self", reveal: { count: "x", filter: { colors: ["R"] }, text: "red cards" } },
      targets: [],
      effect: { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: "x" },
      resolve: null,
      text: TEXT,
    },
  ],
});
