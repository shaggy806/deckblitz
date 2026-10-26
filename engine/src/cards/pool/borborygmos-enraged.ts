import { defineCard } from "../define.js";

export default defineCard({
  name: "Borborygmos Enraged",
  manaCost: "{4}{R}{R}{G}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cyclops"],
  power: 7,
  toughness: 6,
  keywords: ["trample"],
  text: "Trample\nWhenever Borborygmos Enraged deals combat damage to a player, reveal the top three cards of your library. Put all land cards revealed this way into your hand and the rest into your graveyard.\nDiscard a land card: Borborygmos Enraged deals 3 damage to any target.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 3,
        reveal: true,
        min: 3,
        max: 3,
        filter: { type: "land" },
        destination: "hand",
        leftover: "graveyard",
      },
      resolve: null,
      text: "Whenever Borborygmos Enraged deals combat damage to a player, reveal the top three cards of your library. Put all land cards revealed this way into your hand and the rest into your graveyard.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1, filter: { type: "land" } } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: "Discard a land card: Borborygmos Enraged deals 3 damage to any target.",
    },
  ],
});
