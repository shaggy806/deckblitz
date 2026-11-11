import { defineCard } from "../define.js";

// Triggered abilities of cards in graveyards still work, and a land may still
// be played from a graveyard (its rulings): only casting and activating stop.
export default defineCard({
  name: "Ashes of the Abhorrent",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text:
    "Players can't cast spells from graveyards or activate abilities of cards in graveyards.\n" +
    "Whenever a creature dies, you gain 1 life.",
  static: [
    {
      affects: { scope: "self" },
      prohibits: [
        { act: "cast", who: "each-player", from: ["graveyard"] },
        { act: "activate", who: "each-player", of: { inZone: "graveyard" }, anyZone: true },
      ],
      text: "Players can't cast spells from graveyards or activate abilities of cards in graveyards.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: "Whenever a creature dies, you gain 1 life.",
    },
  ],
});
