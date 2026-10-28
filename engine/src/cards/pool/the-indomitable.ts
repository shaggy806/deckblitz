import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

// EDHREC rank 2384.
//
// The graveyard cast is `castFromGraveyardIf` (Gravecrawler's shape),
// checked only as the cast begins (the ruling), for the normal costs; only
// tapped Pirates and tapped Vehicles count, the card itself being in the
// graveyard.

export default defineCard({
  name: "The Indomitable",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: "Trample\nWhenever a creature you control deals combat damage to a player, draw a card.\nCrew 3\nYou may cast this card from your graveyard as long as you control three or more tapped Pirates and/or Vehicles.",
  activated: [crew(3)],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever a creature you control deals combat damage to a player, draw a card.",
    },
  ],
  castFromGraveyardIf: {
    kind: "controls",
    filter: { subtypes: ["Pirate", "Vehicle"], tapped: true },
    atLeast: 3,
  },
});
