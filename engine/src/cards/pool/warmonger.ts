import { defineCard } from "../define.js";

// Mercadian Masques. EDHREC rank 22333.
const TEXT =
  "{2}: This creature deals 1 damage to each creature without flying and each player. Any player may activate this ability.";

export default defineCard({
  name: "Warmonger",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Monger"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: 1 },
          { kind: "damage", amount: 1, who: "each-player" },
        ],
      },
      resolve: null,
      text: TEXT,
      anyPlayer: true,
    },
  ],
});
