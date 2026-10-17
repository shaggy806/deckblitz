import { defineCard } from "../define.js";

// Fell Horseman's Adventure.

export default defineCard({
  name: "Deathly Ride",
  art: "https://cards.scryfall.io/art_crop/back/4/3/43bb3890-4013-48be-8cb5-54fd8fd8ec52.jpg",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Return target creature card from your graveyard to your hand. (Then exile this card. You may cast the creature later from exile.)",
  faces: ["Fell Horseman", "Deathly Ride"],
  adventure: true,
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
});
