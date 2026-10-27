import { defineCard } from "../define.js";

// EDHREC rank 11670. Miren, the Moaning Well's and Jarad's "the sacrificed
// creature's" amounts, behind a Cleric-only sacrifice (Shadow-Rite Priest).

export default defineCard({
  name: "Starlit Sanctum",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{W}, {T}, Sacrifice a Cleric creature: You gain life equal to the sacrificed creature's toughness.\n{B}, {T}, Sacrifice a Cleric creature: Target player loses life equal to the sacrificed creature's power.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: {
        mana: "{W}",
        tap: true,
        sacrifice: { filter: { subtype: "Cleric", type: "creature" } },
      },
      targets: [],
      effect: { kind: "gain-life", amount: { toughnessOf: "sacrificed" } },
      resolve: null,
      text: "{W}, {T}, Sacrifice a Cleric creature: You gain life equal to the sacrificed creature's toughness.",
    },
    {
      cost: {
        mana: "{B}",
        tap: true,
        sacrifice: { filter: { subtype: "Cleric", type: "creature" } },
      },
      targets: ["player"],
      effect: { kind: "lose-life", amount: { powerOf: "sacrificed" }, target: 0 },
      resolve: null,
      text: "{B}, {T}, Sacrifice a Cleric creature: Target player loses life equal to the sacrificed creature's power.",
    },
  ],
});
