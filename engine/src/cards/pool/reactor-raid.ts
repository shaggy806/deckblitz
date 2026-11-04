import { defineCard } from "../define.js";

// Midgar, City of Mako's Adventure.
export default defineCard({
  name: "Reactor Raid",
  art: "https://cards.scryfall.io/art_crop/front/8/a/8a837256-6bb4-4a60-962d-d2793548d26c.jpg",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "You may sacrifice an artifact or creature. If you do, draw two cards. (Then exile this card. You may play the land later from exile.)",
  targets: [],
  effect: {
    kind: "each-player-may",
    who: "you",
    options: [{ sacrifice: { typesAnyOf: ["artifact", "creature"] }, text: "Sacrifice an artifact or creature" }],
    ifDid: { kind: "draw", amount: 2 },
  },
});
