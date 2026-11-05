import { defineCard } from "../define.js";

// EDHREC rank 790.
// Makes Food → use "Food Token".

export default defineCard({
  name: "Peregrin Took",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Halfling", "Citizen"],
  power: 2,
  toughness: 3,
  text: "If one or more tokens would be created under your control, those tokens plus an additional Food token are created instead. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")\nSacrifice three Foods: Draw a card.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Food" }, count: 3 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Sacrifice three Foods: Draw a card.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-create-token", plusOneToken: "Food Token" },
      text: "If one or more tokens would be created under your control, those tokens plus an additional Food token are created instead.",
    },
  ],
});
