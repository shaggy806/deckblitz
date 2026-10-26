import { defineCard } from "../define.js";

// Urza's Destiny. EDHREC rank 17530. Brion Stoutarm's shape, but any creature
// — this one included (its power read as it last existed).

export default defineCard({
  name: "Bloodshot Cyclops",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Cyclops", "Giant"],
  power: 4,
  toughness: 4,
  text: "{T}, Sacrifice a creature: This creature deals damage equal to the sacrificed creature's power to any target.",
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { type: "creature", controlledBy: "you" } } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: { powerOf: "sacrificed" }, target: 0 },
      resolve: null,
      text: "{T}, Sacrifice a creature: This creature deals damage equal to the sacrificed creature's power to any target.",
    },
  ],
});
