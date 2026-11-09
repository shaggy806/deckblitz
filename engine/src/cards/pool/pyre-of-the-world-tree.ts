import { defineCard } from "../define.js";

const DISCARD_TEXT = "Whenever you discard a land card, exile the top card of your library. You may play that card this turn.";

export default defineCard({
  name: "Pyre of the World Tree",
  art: "https://cards.scryfall.io/art_crop/back/f/7/f7cedd62-efc8-464d-8387-220bb55e07e9.jpg",
  colors: ["R"],
  types: ["enchantment"],
  text: `Discard a land card: This enchantment deals 2 damage to any target.\n${DISCARD_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1, filter: { type: "land" } } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "Discard a land card: This enchantment deals 2 damage to any target.",
    },
  ],
  triggered: [
    {
      trigger: { on: "discards", who: "you", filter: { type: "land" }, perCard: true },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn", play: true },
      resolve: null,
      text: DISCARD_TEXT,
    },
  ],
  faces: ["Invasion of Kaldheim", "Pyre of the World Tree"],
  transform: true,
});
