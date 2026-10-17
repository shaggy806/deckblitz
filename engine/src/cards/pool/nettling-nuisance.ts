import { defineCard } from "../define.js";

// EDHREC rank 8139. Wilds of Eldraine Commander. One trigger per player dealt
// combat damage by your Faeries in a damage step (its ruling — the batched
// trigger, Alela, Cunning Conqueror's); that player creates the Pirate, goaded
// by you for the rest of the game (create-token's `goadedForGame`, Rendmaw).
const DAMAGE_TEXT =
  "Whenever one or more Faeries you control deal combat damage to a player, that player creates a 4/2 red Pirate creature token with \"This token can't block.\" The token is goaded for the rest of the game.";

export default defineCard({
  name: "Nettling Nuisance",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Faerie", "Rogue"],
  power: 3,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${DAMAGE_TEXT} (It attacks each combat if able and attacks a player other than you if able.)`,
  triggered: [
    {
      trigger: { on: "deals-damage-batch", who: "you-control", filter: { subtype: "Faerie" }, combat: true },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Pirate Token (Nettling Nuisance)",
        count: 1,
        who: "trigger-player",
        goadedForGame: true,
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
