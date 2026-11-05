import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// Which opponent separates is chosen after the cards are revealed (the ruling).
// Either pile may be empty.

const WARD = ward({ mana: "{2}" });
const DOMAIN =
  "Domain — Whenever this creature deals combat damage to a player, reveal the top X cards of your library, where X is the number of basic land types among lands you control. An opponent separates those cards into two piles. Put one pile into your hand and the other into your graveyard. (Piles can be empty.)";

export default defineCard({
  name: "Sphinx of Clear Skies",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying, ward {2}\n${DOMAIN}`,
  triggered: [
    WARD,
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "separate-into-piles",
        objects: { libraryTop: { basicLandTypes: "you" }, reveal: true },
        separator: "an-opponent",
        chooser: "you",
        chosen: "hand",
        rest: "graveyard",
      },
      resolve: null,
      text: DOMAIN,
    },
  ],
});
