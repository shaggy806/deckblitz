import { defineCard } from "../define.js";

// Playtest card: Priest of Yawgmoth making red mana.

const TEXT = "{T}, Sacrifice an artifact: Add an amount of {R} equal to the sacrificed artifact's mana value.";

export default defineCard({
  name: "Red Priest of Yawgmoth",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Cleric"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { type: "artifact" } } },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: { manaValueOf: { paid: "sacrificed" } } },
      resolve: null,
      text: TEXT,
    },
  ],
});
