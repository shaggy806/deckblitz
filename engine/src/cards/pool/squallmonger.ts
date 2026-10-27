import { defineCard } from "../define.js";

// Mercadian Masques. EDHREC rank 23609.
const TEXT =
  "{2}: This creature deals 1 damage to each creature with flying and each player. Any player may activate this ability.";

export default defineCard({
  name: "Squallmonger",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Monger"],
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
          { kind: "damage-all", filter: { type: "creature", keyword: "flying" }, amount: 1 },
          { kind: "damage", amount: 1, who: "each-player" },
        ],
      },
      resolve: null,
      text: TEXT,
      anyPlayer: true,
    },
  ],
});
