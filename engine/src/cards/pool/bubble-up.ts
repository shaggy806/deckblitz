import { defineCard } from "../define.js";

// Rulings:
//   [2023-09-01] Adventurer cards aren't instant or sorcery cards while they're in your graveyard.
//     You can't use Bubble Up to put an adventurer card from your graveyard on top of your
//     library.

export default defineCard({
  name: "Bubble Up",
  art: "https://cards.scryfall.io/art_crop/back/e/6/e6f03f21-aeb9-428b-9167-b2604919bdd8.jpg",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Put target instant or sorcery card from your graveyard on top of your library. (Then exile this card. You may cast the creature later from exile.)",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
  effect: { kind: "put-on-library", target: 0, position: "top" },
  faces: ["Aquatic Alchemist", "Bubble Up"],
  adventure: true,
});
