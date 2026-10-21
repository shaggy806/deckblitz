import { defineCard } from "../define.js";

// EDHREC rank 25717.

export default defineCard({
  name: "Sparkhunter Masticore",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Masticore"],
  power: 3,
  toughness: 4,
  text: "As an additional cost to cast this spell, discard a card.\nProtection from planeswalkers\n{1}: This creature deals 1 damage to target planeswalker.\n{3}: This creature gains indestructible until end of turn.",
  additionalCost: { discard: 1 },
  static: [
    {
      affects: { scope: "self" },
      protection: { types: ["planeswalker"] },
      text: "Protection from planeswalkers",
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "planeswalker" } }],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{1}: This creature deals 1 damage to target planeswalker.",
    },
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: "{3}: This creature gains indestructible until end of turn.",
    },
  ],
});
