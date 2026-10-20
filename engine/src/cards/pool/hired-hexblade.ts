import { defineCard } from "../define.js";

// EDHREC rank 24227.
//
// The mana spent to cast it stays with the permanent it becomes
// (`GameObject.manaSpentFrom`), so the intervening "if" reads it off the
// source — as it last existed, should it have left before this resolves.

const ETB_TEXT =
  "When this creature enters, if mana from a Treasure was spent to cast it, you draw a card and you lose 1 life.";

export default defineCard({
  name: "Hired Hexblade",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elf", "Warlock"],
  power: 2,
  toughness: 2,
  text: ETB_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { manaFrom: { subtype: "Treasure" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1 },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
