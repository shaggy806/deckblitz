import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). EDHREC rank 19900.
//
// Earthquake's shape at a fixed 4, dealt by this creature, all at once.

const TEXT = "{T}: This creature deals 4 damage to each creature without flying and each player.";

export default defineCard({
  name: "Hammerfist Giant",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 5,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: 4 },
          { kind: "damage", amount: 4, who: "each-player" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
