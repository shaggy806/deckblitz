import { defineCard } from "../define.js";

// "Any color that shares a color with a permanent a player controls": a color
// among every battlefield permanent, whoever controls it (`colorAmong` with
// no `controlledBy`). None coloured makes none (the Mox Amber ruling).

export default defineCard({
  name: "Reflective Gate",
  colors: [],
  types: ["artifact", "land"],
  subtypes: ["Gate", "Food"],
  text: "{T}: Add {C}.\n{T}: Add one mana of any color that shares a color with a permanent a player controls.\n{2}, {T}, Sacrifice this land: You gain 3 life.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { colorAmong: {} }, amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color that shares a color with a permanent a player controls.",
    },
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: "{2}, {T}, Sacrifice this land: You gain 3 life.",
    },
  ],
});
